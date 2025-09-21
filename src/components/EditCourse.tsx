import React, { useState } from 'react';
import { Edit, RotateCcw, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Course, Slide, SlideType } from '../types/course';
import { templates } from '../data/templates';
import { geminiService } from '../services/geminiApi';
import { SlideEditor } from './SlideEditor';

interface EditCourseProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
  onLoading: (loading: boolean) => void;
}

export const EditCourse: React.FC<EditCourseProps> = ({ course, onCourseUpdate, onLoading }) => {
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [regeneratingSlide, setRegeneratingSlide] = useState<string | null>(null);

  const handleEditSlide = (slideId: string) => {
    setEditingSlide(slideId);
  };

  const handleSaveSlide = (slideId: string, updatedContent: any) => {
    const updatedSlides = course.slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, content: updatedContent }
        : slide
    );
    
    onCourseUpdate({
      ...course,
      slides: updatedSlides
    });
    
    setEditingSlide(null);
  };

  const handleRegenerateSlide = async (slideId: string) => {
    const slide = course.slides.find(s => s.id === slideId);
    if (!slide) return;

    setRegeneratingSlide(slideId);
    onLoading(true);

    try {
      const newContent = await geminiService.regenerateSlideContent(
        slide.type,
        course.topic,
        slide.content.title || slide.title
      );

      const updatedSlides = course.slides.map(s => 
        s.id === slideId 
          ? { 
              ...s, 
              title: newContent.title || s.title,
              content: { ...s.content, ...newContent }
            }
          : s
      );
      
      onCourseUpdate({
        ...course,
        slides: updatedSlides
      });
    } catch (error) {
      console.error('Failed to regenerate slide:', error);
      alert('Failed to regenerate slide content. Please try again.');
    } finally {
      setRegeneratingSlide(null);
      onLoading(false);
    }
  };

  const handleRemoveSlide = (slideId: string) => {
    if (course.slides.length <= 1) {
      alert('Cannot remove the last slide. A course must have at least one slide.');
      return;
    }

    const updatedSlides = course.slides
      .filter(slide => slide.id !== slideId)
      .map((slide, index) => ({ ...slide, order: index + 1 }));
    
    onCourseUpdate({
      ...course,
      slides: updatedSlides
    });
  };

  const handleAddSlide = async (templateType: SlideType) => {
    setShowTemplateDropdown(false);
    onLoading(true);

    try {
      const newContent = await geminiService.regenerateSlideContent(
        templateType,
        course.topic,
        ''
      );

      const newSlide: Slide = {
        id: `slide-${Date.now()}`,
        type: templateType,
        title: newContent.title || `New ${templateType} slide`,
        content: newContent,
        order: course.slides.length + 1
      };

      onCourseUpdate({
        ...course,
        slides: [...course.slides, newSlide]
      });
    } catch (error) {
      console.error('Failed to create new slide:', error);
      alert('Failed to create new slide. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  if (editingSlide) {
    const slide = course.slides.find(s => s.id === editingSlide);
    if (slide) {
      return (
        <SlideEditor
          slide={slide}
          onSave={(content) => handleSaveSlide(editingSlide, content)}
          onCancel={() => setEditingSlide(null)}
        />
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <p className="text-gray-600 mt-1">Topic: {course.topic}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showTemplateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleAddSlide(template.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{template.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {course.slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                  Slide {index + 1}
                </span>
                <span className="text-gray-500">
                  {templates.find(t => t.id === slide.type)?.name}
                </span>
                <h3 className="font-semibold text-gray-900">{slide.title}</h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditSlide(slide.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleRegenerateSlide(slide.id)}
                  disabled={regeneratingSlide === slide.id}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate"
                >
                  <RotateCcw className={`w-4 h-4 ${regeneratingSlide === slide.id ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={() => handleRemoveSlide(slide.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <SlidePreview slide={slide} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SlidePreview: React.FC<{ slide: Slide }> = ({ slide }) => {
  switch (slide.type) {
    case 'title':
      return (
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{slide.content.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{slide.content.subtitle}</p>
          {slide.content.overview && (
            <p className="text-gray-700 mb-6 leading-relaxed">
              <strong>Overview:</strong> {slide.content.overview}
            </p>
          )}
          {slide.content.learningObjectives && slide.content.learningObjectives.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Learning Objectives:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {slide.content.learningObjectives.map((objective: string, idx: number) => (
                  <li key={idx}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
      
    case 'content':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.content.title}</h2>
          {slide.content.mainContent && (
            <p className="text-gray-700 mb-4">{slide.content.mainContent}</p>
          )}
          {slide.content.keyPoints && slide.content.keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {slide.content.keyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
      
    case 'quiz':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.content.title}</h2>
          {slide.content.questions?.map((question, idx) => (
            <QuizQuestion key={idx} question={question} questionNumber={idx + 1} />
          ))}
        </div>
      );
      
    case 'summary':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{slide.content.title}</h2>
          {slide.content.summary && slide.content.summary.length > 0 && (
            <div className="mb-4">
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {slide.content.summary.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          {slide.content.conclusion && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">{slide.content.conclusion}</p>
            </div>
          )}
        </div>
      );
      
    default:
      return <div>Unsupported slide type</div>;
  }
};

const QuizQuestion: React.FC<{ question: any; questionNumber: number }> = ({ question, questionNumber }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionClick = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    setShowAnswer(true);
  };

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <p className="font-medium text-gray-900 mb-4 text-lg">
        {questionNumber}. {question.question}
      </p>
      <div className="space-y-2">
        {question.options.map((option: string, optIdx: number) => (
          <div
            key={optIdx}
            onClick={() => handleOptionClick(optIdx)}
            className={`p-3 rounded-lg transition-colors cursor-pointer ${
              showAnswer && optIdx === question.correctAnswer
                ? 'bg-green-100 border border-green-300 text-green-800'
                : showAnswer && optIdx === selectedAnswer && optIdx !== question.correctAnswer
                ? 'bg-red-100 border border-red-300 text-red-800'
                : selectedAnswer === optIdx
                ? 'bg-blue-100 border border-blue-300 text-blue-800'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span> {option}
            {showAnswer && optIdx === question.correctAnswer && (
              <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
            )}
            {showAnswer && optIdx === selectedAnswer && optIdx !== question.correctAnswer && (
              <span className="ml-2 text-red-600 font-medium">✗ Incorrect</span>
            )}
          </div>
        ))}
      </div>
      {showAnswer && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};