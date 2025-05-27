
import React from 'react';
import { Course } from '../types';

interface CourseSelectionScreenProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
}

const CourseCard: React.FC<{ course: Course; onSelect: () => void }> = ({ course, onSelect }) => {
  const IconComponent = course.icon;
  return (
    <div
      className={`relative group bg-slate-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-700 hover:border-${course.themeColor ? course.themeColor.split('-')[1] + '-500' : 'indigo-500'}`}
      onClick={onSelect}
    >
      {IconComponent && (
        <div className={`absolute -top-5 -left-5 p-3 rounded-full shadow-lg ${course.themeColor || 'bg-indigo-600'} group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
      )}
      <div className="mt-4">
        <h3 className={`text-2xl font-semibold text-white mb-2 ${IconComponent ? 'ml-8' : ''}`}>{course.title}</h3>
        <p className="text-gray-400 mb-4 text-sm leading-relaxed">{course.longDescription || course.description}</p>
      </div>
      <button
         className={`w-full mt-auto ${course.themeColor || 'bg-indigo-600'} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${course.themeColor ? course.themeColor.split('-')[1] + '-500' : 'indigo-500'}`}
      >
        Start Learning
      </button>
       <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${course.themeColor || 'bg-indigo-500'} rounded-bl-xl`}></div>
    </div>
  );
};


const CourseSelectionScreen: React.FC<CourseSelectionScreenProps> = ({ courses, onCourseSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-3">
          Welcome to AI Guided Learning
        </h1>
        <p className="text-xl text-slate-300">Choose a course to begin your learning journey!</p>
      </header>
      
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} onSelect={() => onCourseSelect(course)} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400">No courses available at the moment. Please check back later.</p>
      )}

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Learning Platform. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default CourseSelectionScreen;
    