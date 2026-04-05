/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calendar, Star, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameEvent {
  id: string;
  name: string;
  month: number; // 0-11
  day: number;
  priority: number; // 1-10
}

export default function App() {
  const [events, setEvents] = useState<GameEvent[]>(() => {
    const saved = localStorage.getItem('game-promo-events');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'New Year Promo', month: 0, day: 1, priority: 2 },
      { id: '2', name: 'Valentine\'s Special', month: 1, day: 14, priority: 5 },
      { id: '3', name: 'Summer Sale', month: 5, day: 21, priority: 3 },
      { id: '4', name: 'Black Friday', month: 10, day: 28, priority: 1 },
      { id: '5', name: 'Christmas Offer', month: 11, day: 25, priority: 1 },
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPriority, setNewPriority] = useState(5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('game-promo-events', JSON.stringify(events));
  }, [events]);

  const sortedEvents = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    return [...events].sort((a, b) => {
      const getNextDate = (event: GameEvent) => {
        let date = new Date(currentYear, event.month, event.day);
        if (date < now && (date.toDateString() !== now.toDateString())) {
          date = new Date(currentYear + 1, event.month, event.day);
        }
        return date.getTime();
      };

      return getNextDate(a) - getNextDate(b);
    });
  }, [events]);

  const addEvent = () => {
    if (!newName || !newDate) return;
    const [year, month, day] = newDate.split('-').map(Number);
    const newEvent: GameEvent = {
      id: crypto.randomUUID(),
      name: newName,
      month: month - 1,
      day: day,
      priority: newPriority,
    };
    setEvents([...events, newEvent]);
    setNewName('');
    setNewDate('');
    setNewPriority(5);
    setIsAdding(false);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const copyForNotion = () => {
    const header = "| Date | Event | Priority |\n| :--- | :--- | :--- |\n";
    const rows = sortedEvents.map(e => {
      const dateStr = new Date(2000, e.month, e.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `| ${dateStr} | **${e.name}** | P${e.priority} |`;
    }).join('\n');
    
    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-500 bg-red-50';
    if (priority <= 5) return 'text-orange-500 bg-orange-50';
    return 'text-blue-500 bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
        <div className="p-4 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming Promos</span>
            <button 
              onClick={copyForNotion}
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] font-bold text-gray-500 transition-colors"
              title="Copy as Markdown for Notion"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'COPIED' : 'NOTION COPY'}
            </button>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <Plus size={20} />
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50 border-b border-gray-100"
            >
              <div className="p-4 space-y-3">
                <input 
                  type="text" 
                  placeholder="Event Name" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3">
                    <Star size={14} className="text-gray-400" />
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={newPriority}
                      onChange={(e) => setNewPriority(Number(e.target.value))}
                      className="w-8 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={addEvent}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Add Event
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="divide-y divide-gray-50">
          {sortedEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm italic">
              No events scheduled.
            </div>
          ) : (
            sortedEvents.map((event, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;
              
              return (
                <motion.div 
                  layout
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors ${isTop1 ? 'bg-white' : isTop2 ? 'bg-white/80' : 'bg-gray-50/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 transition-all shadow-sm
                      ${isTop1 ? 'w-16 h-16' : isTop2 ? 'w-14 h-14' : isTop3 ? 'w-12 h-12' : 'w-10 h-10'}`}
                    >
                      <span className={`font-bold text-gray-400 uppercase leading-none 
                        ${isTop1 ? 'text-[12px]' : isTop2 ? 'text-[11px]' : isTop3 ? 'text-[10px]' : 'text-[9px]'}`}
                      >
                        {new Date(2000, event.month, event.day).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className={`font-semibold text-gray-700 leading-none mt-1 
                        ${isTop1 ? 'text-2xl' : isTop2 ? 'text-xl' : isTop3 ? 'text-lg' : 'text-base'}`}
                      >
                        {event.day}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-medium text-gray-800 transition-all 
                        ${isTop1 ? 'text-xl' : isTop2 ? 'text-lg' : isTop3 ? 'text-base' : 'text-sm'}`}
                      >
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider transition-all ${getPriorityColor(event.priority)} 
                          ${isTop1 ? 'text-[12px]' : isTop2 ? 'text-[11px]' : isTop3 ? 'text-[10px]' : 'text-[9px]'}`}
                        >
                          P{event.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeEvent(event.id)}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
