import jsPDF from 'jspdf';
import { Course } from '../types/course';

export class PDFExportService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  exportCourseToPDF(course: Course): void {
    this.doc = new jsPDF();
    
    // Set up fonts and styling
    this.doc.setFont('helvetica');
    
    let yPosition = 20;
    const pageWidth = this.doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      this.doc.setFontSize(fontSize);
      const lines = this.doc.splitTextToSize(text, maxWidth);
      this.doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4)) + 5;
    };

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > this.doc.internal.pageSize.height - 20) {
        this.doc.addPage();
        yPosition = 20;
      }
    };

    // Course Title Page
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    yPosition = addWrappedText(course.title, margin, yPosition, contentWidth, 24);
    
    yPosition += 10;
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(`Topic: ${course.topic}`, margin, yPosition, contentWidth, 16);
    
    yPosition += 20;
    
    // Course Overview (if available)
    if (course.slides && course.slides.length > 0) {
      const titleSlide = course.slides.find(slide => slide.type === 'title');
      if (titleSlide && titleSlide.content.overview) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        yPosition = addWrappedText('Course Overview', margin, yPosition, contentWidth, 14);
        
        yPosition += 5;
        this.doc.setFont('helvetica', 'normal');
        yPosition = addWrappedText(titleSlide.content.overview, margin, yPosition, contentWidth, 12);
        yPosition += 10;
      }
    }

    // Add new page for slides
    this.doc.addPage();
    yPosition = 20;

    // Process each slide
    course.slides.forEach((slide, index) => {
      checkPageBreak(50); // Reserve space for slide content
      
      // Slide number and type
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      yPosition = addWrappedText(`Slide ${index + 1}: ${slide.type.toUpperCase()}`, margin, yPosition, contentWidth, 12);
      
      yPosition += 5;
      
      // Slide title
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      yPosition = addWrappedText(slide.title, margin, yPosition, contentWidth, 16);
      
      yPosition += 10;
      
      // Slide content based on type
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(12);
      
      switch (slide.type) {
        case 'title':
          if (slide.content.subtitle) {
            yPosition = addWrappedText(slide.content.subtitle, margin, yPosition, contentWidth, 14);
            yPosition += 10;
          }
          
          if (slide.content.overview) {
            yPosition = addWrappedText(slide.content.overview, margin, yPosition, contentWidth, 12);
            yPosition += 10;
          }
          
          if (slide.content.learningObjectives && slide.content.learningObjectives.length > 0) {
            this.doc.setFont('helvetica', 'bold');
            yPosition = addWrappedText('Learning Objectives:', margin, yPosition, contentWidth, 12);
            yPosition += 5;
            
            this.doc.setFont('helvetica', 'normal');
            slide.content.learningObjectives.forEach((objective) => {
              yPosition = addWrappedText(`• ${objective}`, margin + 10, yPosition, contentWidth - 10, 11);
            });
            yPosition += 10;
          }
          break;
          
        case 'content':
          if (slide.content.mainContent) {
            yPosition = addWrappedText(slide.content.mainContent, margin, yPosition, contentWidth, 12);
            yPosition += 10;
          }
          
          if (slide.content.keyPoints && slide.content.keyPoints.length > 0) {
            this.doc.setFont('helvetica', 'bold');
            yPosition = addWrappedText('Key Points:', margin, yPosition, contentWidth, 12);
            yPosition += 5;
            
            this.doc.setFont('helvetica', 'normal');
            slide.content.keyPoints.forEach((point) => {
              yPosition = addWrappedText(`• ${point}`, margin + 10, yPosition, contentWidth - 10, 11);
            });
            yPosition += 10;
          }
          break;
          
        case 'quiz':
          if (slide.content.questions && slide.content.questions.length > 0) {
            slide.content.questions.forEach((question, qIndex) => {
              checkPageBreak(30);
              
              this.doc.setFont('helvetica', 'bold');
              yPosition = addWrappedText(`Q${qIndex + 1}: ${question.question}`, margin, yPosition, contentWidth, 12);
              yPosition += 5;
              
              this.doc.setFont('helvetica', 'normal');
              question.options.forEach((option, optIndex) => {
                const marker = optIndex === question.correctAnswer ? '[X]' : '[ ]';
                yPosition = addWrappedText(`${marker} ${option}`, margin + 10, yPosition, contentWidth - 10, 11);
              });
              
              if (question.explanation) {
                yPosition += 5;
                this.doc.setFont('helvetica', 'italic');
                yPosition = addWrappedText(`Explanation: ${question.explanation}`, margin + 10, yPosition, contentWidth - 10, 10);
                this.doc.setFont('helvetica', 'normal');
              }
              
              yPosition += 10;
            });
          }
          break;
          
        case 'summary':
          if (slide.content.summary && slide.content.summary.length > 0) {
            this.doc.setFont('helvetica', 'bold');
            yPosition = addWrappedText('Summary Points:', margin, yPosition, contentWidth, 12);
            yPosition += 5;
            
            this.doc.setFont('helvetica', 'normal');
            slide.content.summary.forEach((point) => {
              yPosition = addWrappedText(`• ${point}`, margin + 10, yPosition, contentWidth - 10, 11);
            });
            yPosition += 10;
          }
          
          if (slide.content.conclusion) {
            this.doc.setFont('helvetica', 'bold');
            yPosition = addWrappedText('Conclusion:', margin, yPosition, contentWidth, 12);
            yPosition += 5;
            
            this.doc.setFont('helvetica', 'normal');
            yPosition = addWrappedText(slide.content.conclusion, margin, yPosition, contentWidth, 12);
            yPosition += 10;
          }
          break;
      }
      
      yPosition += 5; // Space between slides
    });

    // Add footer with course info
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      // this.doc.text(
      //   `Generated on ${new Date().toLocaleDateString()} | ${course.title}`,
      //   margin,
      //   this.doc.internal.pageSize.height - 10
      // );
    }

    // Download the PDF
    const fileName = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course.pdf`;
    this.doc.save(fileName);
  }
}

export const pdfExportService = new PDFExportService();
