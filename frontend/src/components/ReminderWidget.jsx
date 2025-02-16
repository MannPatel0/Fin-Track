// ReminderWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ReminderWidget = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(5);
    
    if (data) setReminders(data);
  };

  const totalUpcoming = reminders.reduce((sum, reminder) => sum + parseFloat(reminder.amount), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Upcoming Payments</h3>
        </div>
        <div className="text-lg font-bold text-purple-600">
          ${totalUpcoming.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div 
            key={reminder.id}
            className="flex items-center justify-between p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100"
            onClick={() => navigate('/reminders')}
          >
            <div>
              <div className="font-medium">{reminder.title}</div>
              <div className="text-sm text-gray-600">
                Due: {new Date(reminder.due_date).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${parseFloat(reminder.amount).toFixed(2)}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No upcoming payments
          </div>
        )}
        <button
          onClick={() => navigate('/reminders')}
          className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2"
        >
          View All Reminders
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ReminderWidget;