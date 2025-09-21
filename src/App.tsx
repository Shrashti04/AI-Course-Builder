import React, { useState } from 'react';
import { Header } from './components/Header';
import { CreateCourse } from './components/CreateCourse';
import { EditCourse } from './components/EditCourse';
import { PreviewCourse } from './components/PreviewCourse';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Course } from './types/course';

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'preview'>('create');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCourseCreated = (course: Course) => {
    setActiveCourse(course);
    setActiveTab('edit');
  };

  const handleCourseUpdate = (course: Course) => {
    setActiveCourse(course);
  };

  const handleTabChange = (tab: 'create' | 'edit' | 'preview') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        hasActiveCourse={!!activeCourse}
      />
      
      <main className="pb-8">
        {activeTab === 'create' && (
          <CreateCourse 
            onCourseCreated={handleCourseCreated}
            onLoading={setIsLoading}
          />
        )}
        
        {activeTab === 'edit' && activeCourse && (
          <EditCourse 
            course={activeCourse}
            onCourseUpdate={handleCourseUpdate}
            onLoading={setIsLoading}
          />
        )}
        
        {activeTab === 'preview' && activeCourse && (
          <PreviewCourse course={activeCourse} />
        )}
      </main>

      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;