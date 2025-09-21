const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Debug logging (uncomment for debugging)
// console.log('Environment check:');
// console.log('import.meta.env:', import.meta.env);
// console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
// console.log('GEMINI_API_KEY:', GEMINI_API_KEY);

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiService {
  private async makeRequest(prompt: string): Promise<string> {
    try {
      // Check if API key is available
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Please check your .env file.');
      }

      const request: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      console.log('Making request to Gemini API...');
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('API Response data:', data);
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('No response generated');
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateCourseStructure(topic: string, slideCount: number = 6): Promise<any> {
    const prompt = `Create a comprehensive course structure for the topic: "${topic}". 

    Please provide a JSON response with the following structure:
    {
      "title": "Course Title",
      "subtitle": "Course Subtitle", 
      "overview": "Brief course overview",
      "learningObjectives": ["Objective 1", "Objective 2", "Objective 3", "Objective 4"],
      "slides": [
        {
          "type": "title",
          "title": "Course Title",
          "subtitle": "Course Subtitle",
          "overview": "Course overview",
          "learningObjectives": ["list of objectives"]
        },
        {
          "type": "content", 
          "title": "Chapter/Section Title",
          "mainContent": "Detailed explanation",
          "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
        },
        {
          "type": "quiz",
          "title": "Knowledge Check",
          "questions": [
            {
              "question": "Question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Why this answer is correct"
            }
          ]
        },
        {
          "type": "summary",
          "title": "Course Summary", 
          "summary": ["Summary point 1", "Summary point 2", "Summary point 3"],
          "conclusion": "Final thoughts and next steps"
        }
      ]
    }

    Make sure to create engaging, educational content that is comprehensive and well-structured. Include exactly ${slideCount} slides total with a good mix of content types. Return only valid JSON.`;

    const response = await this.makeRequest(prompt);
    
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Failed to parse course structure from AI response');
    }
  }

  async regenerateSlideContent(slideType: string, topic: string, currentTitle: string): Promise<any> {
    let prompt = '';
    
    switch (slideType) {
      case 'title':
        prompt = `Generate NEW and DIFFERENT title slide content for the topic: "${topic}". Make it different from "${currentTitle}".
        
        Return JSON format:
        {
          "title": "New Course Title",
          "subtitle": "New Course Subtitle",
          "overview": "New course overview",
          "learningObjectives": ["New objective 1", "New objective 2", "New objective 3", "New objective 4"]
        }`;
        break;
        
      case 'content':
        prompt = `Generate NEW and DIFFERENT content slide for the topic: "${topic}". Make it completely different from the current content.
        
        Return JSON format:
        {
          "title": "New Section Title",
          "mainContent": "New detailed explanation",
          "keyPoints": ["New key point 1", "New key point 2", "New key point 3"]
        }`;
        break;
        
      case 'quiz':
        prompt = `Generate NEW and DIFFERENT quiz questions for the topic: "${topic}". Create completely new questions.
        
        Return JSON format:
        {
          "title": "Knowledge Check",
          "questions": [
            {
              "question": "New question 1?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Explanation for correct answer"
            },
            {
              "question": "New question 2?", 
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 1,
              "explanation": "Explanation for correct answer"
            }
          ]
        }`;
        break;
        
      case 'summary':
        prompt = `Generate NEW and DIFFERENT summary slide for the topic: "${topic}". Create fresh summary points and conclusion.
        
        Return JSON format:
        {
          "title": "Course Summary",
          "summary": ["New summary point 1", "New summary point 2", "New summary point 3", "New summary point 4"],
          "conclusion": "New conclusion and next steps"
        }`;
        break;
    }

    const response = await this.makeRequest(prompt);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Failed to parse regenerated content from AI response');
    }
  }
}

export const geminiService = new GeminiService();