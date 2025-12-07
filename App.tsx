import React, { useState, useEffect, useMemo } from 'react';
import { Bell, ListFilter, Plus } from 'lucide-react';
import SmartInput from './components/SmartInput';
import ReminderCard from './components/ReminderCard';
import EmptyState from './components/EmptyState';
import { Reminder, FilterType } from './types';

// Mock data for initial view if local storage is empty
const MOCK_DATA: Reminder[] = [];

function App() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_DATA;
      }
    }
    return MOCK_DATA;
  });
  
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [showManualAdd, setShowManualAdd] = useState(false);
  
  // Manual Add State
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(r => {
        if (!r.completed) {
          const due = new Date(r.dueDate);
          const diff = due.getTime() - now.getTime();
          // Alert if due within the last minute (and not processed yet - in a real app we'd flag this)
          if (diff < 0 && diff > -60000) {
             // Simple in-app notification check
             // In a real robust app we would mark 'notified'
          }
        }
      });
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [reminders]);

  const addReminder = (data: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [newReminder, ...prev]);
    setShowManualAdd(false);
    resetManualForm();
  };

  const resetManualForm = () => {
    setManualTitle('');
    setManualDate('');
    setManualTime('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualDate || !manualTime) return;

    const dateTimeString = `${manualDate}T${manualTime}`;
    const dueDate = new Date(dateTimeString).toISOString();

    addReminder({
      title: manualTitle,
      dueDate: dueDate,
      description: ''
    });
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const filteredReminders = useMemo(() => {
    let sorted = [...reminders].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    switch (filter) {
      case FilterType.ACTIVE:
        return sorted.filter(r => !r.completed);
      case FilterType.COMPLETED:
        return sorted.filter(r => r.completed);
      case FilterType.OVERDUE:
        return sorted.filter(r => !r.completed && new Date(r.dueDate) < new Date());
      default:
        return sorted;
    }
  }, [reminders, filter]);

  const stats = useMemo(() => {
    return {
      active: reminders.filter(r => !r.completed).length,
      completed: reminders.filter(r => r.completed).length,
      overdue: reminders.filter(r => !r.completed && new Date(r.dueDate) < new Date()).length
    };
  }, [reminders]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              RemindAI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
             <div className="hidden sm:flex gap-4">
                <span>{stats.active} Active</span>
                <span>{stats.overdue} Overdue</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Smart Input Section */}
        <SmartInput onAddReminder={addReminder} />

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200 self-start">
            {[
              { label: 'All', value: FilterType.ALL },
              { label: 'Active', value: FilterType.ACTIVE },
              { label: 'Overdue', value: FilterType.OVERDUE },
              { label: 'Done', value: FilterType.COMPLETED },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowManualAdd(!showManualAdd)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {showManualAdd ? 'Close Form' : (
              <>
                <Plus className="w-4 h-4" />
                <span>Manual Add</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Add Form */}
        {showManualAdd && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
            <h2 className="text-lg font-semibold mb-4">Add New Reminder</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What needs to be done?</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g., Update project documentation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-3">
          {filteredReminders.length > 0 ? (
            filteredReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={toggleReminder}
                onDelete={deleteReminder}
              />
            ))
          ) : (
            <EmptyState 
              message={
                filter === FilterType.ALL 
                  ? "You're all caught up! Add a new reminder to get started." 
                  : `No ${filter.toLowerCase()} reminders found.`
              } 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
