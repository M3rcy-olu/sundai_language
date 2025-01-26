"use client"
import { useState } from 'react';
import { generateResponse } from '../../../api/typescript/OpenAI';
import { NextResponse } from "next/server";

// TODO: Implement the UI for this component
// Component that queries the LLM and returns the reponse
 

export default function LLMQuery() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<{ Spanish: string; English: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateResponse(userInput);
      setResponse(result.response);
      setUserInput(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error in LLM query:', error);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your Spanish text here..."
            className="w-full p-2 border rounded-md min-h-[100px]"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Submit'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mt-4">
          {error}
        </div>
      )}

      {response.length > 0 && (
        <div className="mt-6 space-y-4">
          {response.map((item, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="font-semibold text-green-600">
                Spanish: {item.Spanish}
              </div>
              <div className="mt-2 text-gray-700">
                English: {item.English}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Rest of your component code
}