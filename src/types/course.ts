export interface Course {
  id: string;
  title: string;
  topic: string;
  createdAt: Date;
  slides: Slide[];
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: SlideContent;
  order: number;
}

export type SlideType = 'title' | 'content' | 'quiz' | 'summary';

export interface SlideContent {
  title?: string;
  subtitle?: string;
  overview?: string;
  learningObjectives?: string[];
  mainContent?: string;
  keyPoints?: string[];
  questions?: QuizQuestion[];
  summary?: string[];
  conclusion?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Template {
  id: SlideType;
  name: string;
  description: string;
  icon: string;
}