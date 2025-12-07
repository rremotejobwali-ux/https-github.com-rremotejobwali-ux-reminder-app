import React from 'react';
import { Check, Clock, Trash2, AlertCircle } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onToggle, onDelete }) => {
  const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div 
      className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
        reminder.completed 
          ? 'bg-gray-50 border-gray-100 opacity-75' 
          : 'bg-white border-gray-200 shadow-sm'
      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
    >
      <button
        onClick={() => onToggle(reminder.id)}
        className={`flex-shrink-0 w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
          reminder.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 text-transparent hover:border-indigo-500'
        }`}
      >
        <Check className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-medium truncate transition-all ${
          reminder.completed ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}>
          {reminder.title}
        </h3>
        {reminder.description && (
          <p className={`text-sm mt-1 ${
            reminder.completed ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {reminder.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mt-3">
          <div className={`flex items-center text-xs font-medium ${
            isOverdue ? 'text-red-600' : reminder.completed ? 'text-gray-400' : 'text-indigo-600'
          }`}>
            {isOverdue ? <AlertCircle className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
            {formatDate(reminder.dueDate)}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(reminder.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
        aria-label="Delete reminder"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ReminderCard;
