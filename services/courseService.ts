
import { Course } from '../types';

const generateSystemPrompt = (course: Course): string => {
  const topicsList = course.lessonSteps
    .map((step, index) => `${index + 1}. ${step.title} (Objective: ${step.objective})`)
    .join('\n');

  let prompt = course.initialSystemPromptTemplate;
  prompt = prompt.replace('{aiPersona}', course.aiPersona);
  prompt = prompt.replace('{courseTitle}', course.title);
  prompt = prompt.replace('{topicsList}', topicsList);
  
  return prompt;
};

export const courseService = {
  generateSystemPrompt,
};
    