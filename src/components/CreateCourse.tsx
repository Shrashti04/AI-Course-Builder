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
  const [slideCount, setSlideCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // New state for stepper and slide types
  const [step, setStep] = useState<'input' | 'select-types'>('input');
  const [slideTypes, setSlideTypes] = useState<string[]>([]);

  // Slide type options (updated)
  const slideTypeOptions = [
    { value: 'title', label: 'Title' },
    { value: 'content', label: 'Content' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'summary', label: 'Summary' },
  ];

  // Helper to get default slide type for each position (updated)
  const getDefaultSlideType = (index: number, total: number) => {
    if (index === 0) return 'title';
    if (index === total - 1) return 'summary';
    return 'content';
  };

  // Step 1: After user enters topic and slide count, show table
  const handleShowSlideTypeTable = () => {
    if (!topic.trim() || slideCount < 1) return;
    // Pre-fill slideTypes with defaults
    const types = Array.from({ length: slideCount }, (_, i) =>
      getDefaultSlideType(i, slideCount)
    );
    setSlideTypes(types);
    setStep('select-types');
  };

  // Step 2: After user edits dropdowns and clicks Generate Slides
  const handleGenerateSlides = async () => {
    setIsGenerating(true);
    onLoading(true);

    try {
      const slides = [];
      for (let i = 0; i < slideTypes.length; i++) {
        const type = slideTypes[i];
        // Map dropdown type to API type
        let geminiType = type;
        // All types except 'quiz' and 'summary' map to 'content'
        if (type === 'content' || type === 'title') geminiType = 'content';

        const content = await geminiService.regenerateSlideContent(
          geminiType,
          topic,
          ''
        );

        slides.push({
          id: `slide-${i + 1}`,
          type: type as import('../types/course').SlideType,
          title: content.title || `Slide ${i + 1}`,
          content: {
            ...content,
            learningObjectives: content.learningObjectives || [],
            keyPoints: content.keyPoints || [],
            questions: content.questions || [],
            summary: content.summary || [],
          },
          order: i + 1,
        });
      }

      const course: Course = {
        id: `course-${Date.now()}`,
        title: topic.trim(),
        topic: topic.trim(),
        createdAt: new Date(),
        slides,
      };

      onCourseCreated(course);
    } catch (error) {
      console.error('Failed to generate slides:', error);
      alert('Failed to generate slides.');
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
          Enter a topic and customize your course structure
        </p>
      </div>

      {step === 'input' && (
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
              Number of Slides (minimum 1)
            </label>
            <input
              type="number"
              id="slideCount"
              min="1"
              value={slideCount}
              onChange={(e) => setSlideCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isGenerating}
            />
            <p className="text-sm text-gray-600 mt-2">
              Choose how many slides you want in your course (minimum 1)
            </p>
          </div>

          <button
            onClick={handleShowSlideTypeTable}
            disabled={!topic.trim() || slideCount < 1 || isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            Next: Select Slide Types
          </button>
        </div>
      )}

      {step === 'select-types' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Customize Slide Types</h3>
          <table className="w-full mb-6 border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Label</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Slide Type</th>
              </tr>
            </thead>
            <tbody>
              {slideTypes.map((type, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-4 font-medium text-gray-900">Slide {idx + 1}</td>
                  <td className="py-2 px-4">
                    <select
                      value={type}
                      onChange={(e) => {
                        const newTypes = [...slideTypes];
                        newTypes[idx] = e.target.value;
                        setSlideTypes(newTypes);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {slideTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleGenerateSlides}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            Generate Slides
          </button>
        </div>
      )}

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