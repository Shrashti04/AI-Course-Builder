import React, { useState } from 'react';
import { Download, FileText, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Course } from '../types/course';
import { pdfExportService } from '../services/pdfExport';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface PreviewCourseProps {
  course: Course;
}

export const PreviewCourse: React.FC<PreviewCourseProps> = ({ course }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState(course.slides);
  const currentSlide = slides[currentSlideIndex];

  const nextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newSlides = Array.from(slides);
    const [reorderedItem] = newSlides.splice(result.source.index, 1);
    newSlides.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }));

    setSlides(updatedSlides);
    
    // Update current slide index if needed
    if (result.source.index === currentSlideIndex) {
      setCurrentSlideIndex(result.destination.index);
    } else if (result.source.index < currentSlideIndex && result.destination.index >= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (result.source.index > currentSlideIndex && result.destination.index <= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const exportAsHTML = () => {
    const htmlContent = generateHTMLExport(course);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    try {
      const updatedCourse = { ...course, slides };
      pdfExportService.exportCourseToPDF(updatedCourse);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Preview</h2>
          <p className="text-gray-600 mt-1">
            {course.slides.length} slides • Ready to export
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAsHTML}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export as HTML</span>
          </button>
          
          <button
            onClick={exportAsPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Course Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Slide Navigation */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Slide {currentSlideIndex + 1}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {currentSlide.type.charAt(0).toUpperCase() + currentSlide.type.slice(1)} Slide
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={course.slides.length <= 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              disabled={course.slides.length <= 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="p-8 min-h-96">
          <SlidePreview slide={currentSlide} />
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Slides</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {slides.map((slide, index) => (
                  <Draggable key={slide.id} draggableId={slide.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          index === currentSlideIndex
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        } ${snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Slide {index + 1}: {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {slide.content.title || slide.title}
                            </div>
                          </div>
                          <div
                            {...provided.dragHandleProps}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

const SlidePreview: React.FC<{ slide: any }> = ({ slide }) => {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.content.title}</h2>
          {slide.content.mainContent && (
            <p className="text-gray-700 mb-6 leading-relaxed">{slide.content.mainContent}</p>
          )}
          {slide.content.keyPoints && slide.content.keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Points:</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {slide.content.keyPoints.map((point: string, idx: number) => (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.content.title}</h2>
          {slide.content.questions?.map((question: any, idx: number) => (
            <QuizQuestion key={idx} question={question} questionNumber={idx + 1} />
          ))}
        </div>
      );
      
    case 'summary':
      return (
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.content.title}</h2>
          {slide.content.summary && slide.content.summary.length > 0 && (
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {slide.content.summary.map((point: string, idx: number) => (
                  <li key={idx} className="text-lg">{point}</li>
                ))}
              </ul>
            </div>
          )}
          {slide.content.conclusion && (
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 text-lg leading-relaxed">{slide.content.conclusion}</p>
            </div>
          )}
        </div>
      );
      
    default:
      return <div>Unsupported slide type</div>;
  }
};

const generateHTMLExport = (course: Course): string => {
  const slidesHTML = course.slides.map((slide) => {
    let slideContent = '';
    
    switch (slide.type) {
      case 'title':
        slideContent = `
          <div class="slide title-slide">
            <h1>${slide.content.title}</h1>
            <p class="subtitle">${slide.content.subtitle || ''}</p>
            ${slide.content.overview ? `<p class="overview"><strong>Overview:</strong> ${slide.content.overview}</p>` : ''}
            ${slide.content.learningObjectives ? `
              <div class="objectives">
                <h4>Learning Objectives:</h4>
                <ul>
                  ${slide.content.learningObjectives.map((obj: string) => `<li>${obj}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        break;
        
      case 'content':
        slideContent = `
          <div class="slide content-slide">
            <h2>${slide.content.title}</h2>
            ${slide.content.mainContent ? `<p class="main-content">${slide.content.mainContent}</p>` : ''}
            ${slide.content.keyPoints ? `
              <div class="key-points">
                <h4>Key Points:</h4>
                <ul>
                  ${slide.content.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        break;
        
      case 'quiz':
        slideContent = `
          <div class="slide quiz-slide">
            <h2>${slide.content.title}</h2>
            ${slide.content.questions?.map((q: any, qIdx: number) => `
              <div class="question">
                <p class="question-text"><strong>${qIdx + 1}. ${q.question}</strong></p>
                <div class="options">
                  ${q.options.map((option: string, oIdx: number) => `
                    <div class="option ${oIdx === q.correctAnswer ? 'correct' : ''}">
                      ${String.fromCharCode(65 + oIdx)}. ${option}
                      ${oIdx === q.correctAnswer ? ' ✓' : ''}
                    </div>
                  `).join('')}
                </div>
                ${q.explanation ? `<p class="explanation"><strong>Explanation:</strong> ${q.explanation}</p>` : ''}
              </div>
            `).join('') || ''}
          </div>
        `;
        break;
        
      case 'summary':
        slideContent = `
          <div class="slide summary-slide">
            <h2>${slide.content.title}</h2>
            ${slide.content.summary ? `
              <ul class="summary-points">
                ${slide.content.summary.map((point: string) => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
            ${slide.content.conclusion ? `
              <div class="conclusion">
                <p>${slide.content.conclusion}</p>
              </div>
            ` : ''}
          </div>
        `;
        break;
    }
    
    return slideContent;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${course.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .course-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .course-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .slide { margin: 40px 0; page-break-after: always; }
        .title-slide { text-align: left; }
        .title-slide h1 { font-size: 2.5em; color: #333; margin-bottom: 10px; }
        .subtitle { font-size: 1.3em; color: #666; margin-bottom: 20px; }
        .overview { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        h2 { color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
        h4 { color: #555; margin: 20px 0 10px 0; }
        ul { padding-left: 20px; }
        li { margin: 10px 0; }
        .question { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .question-text { font-weight: bold; margin-bottom: 15px; }
        .option { padding: 8px; margin: 5px 0; background: white; border: 1px solid #ddd; border-radius: 3px; }
        .option.correct { background: #d4edda; border-color: #c3e6cb; color: #155724; font-weight: bold; }
        .explanation { margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 3px; font-size: 0.9em; }
        .conclusion { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-top: 20px; }
        .generated-info { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
      </style>
    </head>
    <body>
      <div class="course-container">
        <div class="course-header">
          <h1>${course.title}</h1>
          <p>Topic: ${course.topic}</p>
        </div>
        
        ${slidesHTML}
        
        <div class="generated-info">
          <p>Generated on ${new Date().toLocaleDateString()} with AI Course Builder</p>
        </div>
      </div>
    </body>
    </html>
  `;
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