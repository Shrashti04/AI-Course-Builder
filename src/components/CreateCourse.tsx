import React, { useState } from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import { templates } from '../data/templates';
import { geminiService } from '../services/geminiApi';
import { Course } from '../types/course';

interface CreateCourseProps {
  onCourseCreated: (course: Course) => void;
  onLoading: (loading: boolean) => void;
}

export const CreateCourse: React.FC<CreateCourseProps> = ({ onCourseCreated, onLoading }) => {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCourse = async () => {
    if (!topic.trim() || slideCount < 4) return;
    
    setIsGenerating(true);
    onLoading(true);
    
    try {
      const courseData = await geminiService.generateCourseStructure(topic, slideCount);
      
      const course: Course = {
        id: `course-${Date.now()}`,
        title: courseData.title,
        topic: topic.trim(),
        createdAt: new Date(),
        slides: courseData.slides.map((slide: any, index: number) => ({
          id: `slide-${index + 1}`,
          type: slide.type,
          title: slide.title,
          content: {
            ...slide,
            learningObjectives: slide.learningObjectives || [],
            keyPoints: slide.keyPoints || [],
            questions: slide.questions || [],
            summary: slide.summary || []
          },
          order: index + 1
        }))
      };
      
      onCourseCreated(course);
    } catch (error) {
      console.error('Failed to generate course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate course: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      onLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Creating Your Course</h2>
        <p className="text-lg text-gray-600">
          Enter a topic and let AI generate a complete course structure
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <label htmlFor="topic" className="block text-lg font-semibold text-gray-900 mb-3">
            Course Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Introduction to Machine Learning, Web Development Basics, Digital Marketing..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isGenerating}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="slideCount" className="block text-lg font-semibold text-gray-900 mb-3">
            Number of Slides (minimum 4)
          </label>
          <input
            type="number"
            id="slideCount"
            min="4"
            value={slideCount}
            onChange={(e) => setSlideCount(Math.max(4, parseInt(e.target.value) || 4))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isGenerating}
          />
          <p className="text-sm text-gray-600 mt-2">
            Choose how many slides you want in your course (minimum 4)
          </p>
        </div>

        <button
          onClick={handleGenerateCourse}
          disabled={!topic.trim() || slideCount < 4 || isGenerating}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isGenerating ? 'Generating your course content slides...' : 'Generate Course'}</span>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-amber-600 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Available Templates</h3>
            <p className="text-amber-800 text-sm mb-4">
              AI will automatically select and structure your course using these templates:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};