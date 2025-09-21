import React from 'react';
import { BookOpen, Edit3, Eye } from 'lucide-react';

interface HeaderProps {
  activeTab: 'create' | 'edit' | 'preview';
  onTabChange: (tab: 'create' | 'edit' | 'preview') => void;
  hasActiveCourse: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, hasActiveCourse }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Course Builder</h1>
            <p className="text-sm text-gray-600">Create professional courses with AI assistance</p>
          </div>
        </div>
{/* 
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 mr-4">⚡ Powered by AI</span>
        </div> */}
      </div>

      <nav className="flex space-x-1 mt-6 max-w-7xl mx-auto">
        <button
          onClick={() => onTabChange('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          + Create Course
        </button>
        
        <button
          onClick={() => onTabChange('edit')}
          disabled={!hasActiveCourse}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
            activeTab === 'edit' && hasActiveCourse
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : hasActiveCourse
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Course</span>
        </button>
        
        <button
          onClick={() => onTabChange('preview')}
          disabled={!hasActiveCourse}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
            activeTab === 'preview' && hasActiveCourse
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : hasActiveCourse
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Preview & Export</span>
        </button>
      </nav>
    </header>
  );
};