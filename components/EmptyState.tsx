import React from 'react';
import { Calendar } from 'lucide-react';

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No reminders found</h3>
      <p className="text-gray-500 max-w-xs mx-auto">{message}</p>
    </div>
  );
};

export default EmptyState;
