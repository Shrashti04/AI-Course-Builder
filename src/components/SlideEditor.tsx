import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Slide } from '../types/course';

interface SlideEditorProps {
  slide: Slide;
  onSave: (content: any) => void;
  onCancel: () => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onSave, onCancel }) => {
  const [content, setContent] = useState(slide.content);

  const handleSave = () => {
    onSave(content);
  };

  const updateContent = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: string, index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev]?.map((item: any, idx: number) => 
        idx === index ? value : item
      ) || []
    }));
  };

  const addToArray = (field: string) => {
    setContent(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[] || []), '']
    }));
  };

  const removeFromArray = (field: string, index: number) => {
    setContent(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[] || []).filter((_: any, idx: number) => idx !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Edit {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {slide.type === 'title' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={content.subtitle || ''}
                  onChange={(e) => updateContent('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                <textarea
                  value={content.overview || ''}
                  onChange={(e) => updateContent('overview', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Learning Objectives</label>
                  <button
                    onClick={() => addToArray('learningObjectives')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Objective
                  </button>
                </div>
                {(content.learningObjectives || []).map((objective: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeFromArray('learningObjectives', index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {slide.type === 'content' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Content</label>
                <textarea
                  value={content.mainContent || ''}
                  onChange={(e) => updateContent('mainContent', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Key Points</label>
                  <button
                    onClick={() => addToArray('keyPoints')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Point
                  </button>
                </div>
                {(content.keyPoints || []).map((point: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateArrayField('keyPoints', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeFromArray('keyPoints', index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {slide.type === 'quiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Questions</label>
                  <button
                    onClick={() => addToArray('questions')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Question
                  </button>
                </div>
                {(content.questions || []).map((question: any, qIndex: number) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Question {qIndex + 1}</label>
                      <button
                        onClick={() => removeFromArray('questions', qIndex)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={question.question || ''}
                      onChange={(e) => {
                        const newQuestions = [...(content.questions || [])];
                        newQuestions[qIndex] = { ...newQuestions[qIndex], question: e.target.value };
                        updateContent('questions', newQuestions);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                      placeholder="Enter question text"
                    />
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {question.options?.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newQuestions = [...(content.questions || [])];
                              newQuestions[qIndex].options[oIndex] = e.target.value;
                              updateContent('questions', newQuestions);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...(content.questions || [])];
                              newQuestions[qIndex].options.splice(oIndex, 1);
                              if (newQuestions[qIndex].correctAnswer >= oIndex) {
                                newQuestions[qIndex].correctAnswer = Math.max(0, newQuestions[qIndex].correctAnswer - 1);
                              }
                              updateContent('questions', newQuestions);
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...(content.questions || [])];
                          newQuestions[qIndex].options = [...(newQuestions[qIndex].options || []), ''];
                          updateContent('questions', newQuestions);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <select
                        value={question.correctAnswer || 0}
                        onChange={(e) => {
                          const newQuestions = [...(content.questions || [])];
                          newQuestions[qIndex].correctAnswer = parseInt(e.target.value);
                          updateContent('questions', newQuestions);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {question.options?.map((_: string, oIndex: number) => (
                          <option key={oIndex} value={oIndex}>
                            Option {String.fromCharCode(65 + oIndex)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => {
                          const newQuestions = [...(content.questions || [])];
                          newQuestions[qIndex] = { ...newQuestions[qIndex], explanation: e.target.value };
                          updateContent('questions', newQuestions);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Explanation for the correct answer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {slide.type === 'summary' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Summary Points</label>
                  <button
                    onClick={() => addToArray('summary')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Point
                  </button>
                </div>
                {(content.summary || []).map((point: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateArrayField('summary', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeFromArray('summary', index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
                <textarea
                  value={content.conclusion || ''}
                  onChange={(e) => updateContent('conclusion', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};