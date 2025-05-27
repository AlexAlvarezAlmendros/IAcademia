
import React, { useState, useEffect } from 'react';
import { Course } from './types';
import { COURSES } from './constants';
import CourseSelectionScreen from './components/CourseSelectionScreen';
import ChatScreen from './components/ChatScreen';
import Alert from './components/Alert';

const App: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    // This is a placeholder for process.env.API_KEY. In a real build setup (e.g., Vite, Webpack),
    // process.env.API_KEY would be replaced by its actual value or an empty string if not set.
    // For this environment, we simulate it might be missing.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // In a real scenario, you might get it from a global variable injected by the environment.
      // For example: const apiKey = (window as any).APP_CONFIG?.API_KEY;
      // For now, let's assume it's critical and show an error if "missing".
      // For local development, you can set it like:
      // `VITE_GEMINI_API_KEY=your_key npm run dev` if using Vite
      // Or temporarily hardcode for testing like: `const apiKey = "YOUR_API_KEY_HERE";`
      // BUT THE PROMPT REQUIRES `process.env.API_KEY` to be used directly.
      // So, we check if `process.env.API_KEY` is falsy.
      if (!process.env.API_KEY) { // Check the actual variable as required
         console.warn("API_KEY environment variable is not set. AI features will be disabled.");
         setApiKeyMissing(true);
      }
    }
  }, []);

  const handleCourseSelect = (course: Course) => {
    if (apiKeyMissing) return;
    setSelectedCourse(course);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Alert type="error" title="Configuration Error">
          The Gemini API Key is missing. Please ensure the <code>API_KEY</code> environment variable is set. AI functionalities are disabled.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white flex flex-col">
      {!selectedCourse ? (
        <CourseSelectionScreen courses={COURSES} onCourseSelect={handleCourseSelect} />
      ) : (
        <ChatScreen course={selectedCourse} onBack={handleBackToCourses} />
      )}
    </div>
  );
};

export default App;
    