import React, { useState, KeyboardEvent } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { parseNaturalLanguageReminder } from '../services/geminiService';
import { Reminder } from '../types';

interface SmartInputProps {
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onAddReminder }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseNaturalLanguageReminder(input);
      
      if (result) {
        onAddReminder({
          title: result.title,
          description: result.description || '',
          dueDate: result.dueDate || new Date().toISOString(),
        });
        setInput('');
      } else {
        setError("Couldn't understand that. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleProcess();
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-lg p-2 flex items-center shadow-xl ring-1 ring-gray-900/5">
          <div className="p-2 text-indigo-600">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <input
            type="text"
            className="flex-1 p-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            placeholder="Ask AI to remind you... (e.g., 'Buy milk tomorrow at 5pm')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
          <button
            onClick={handleProcess}
            disabled={!input.trim() || isProcessing}
            className={`p-3 rounded-md transition-all duration-200 ${
              input.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 pl-2 animate-pulse">{error}</p>
      )}
      <p className="mt-2 text-xs text-gray-400 pl-2 text-center sm:text-left">
        ✨ Powered by Gemini. Try natural language like "Remind me to call Mom in 30 minutes"
      </p>
    </div>
  );
};

export default SmartInput;
