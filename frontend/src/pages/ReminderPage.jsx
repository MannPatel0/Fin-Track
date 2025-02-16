// ReminderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, X, Calendar, List, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ReminderPage = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
    amount: '',
    description: '',
    category: 'bill'
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (data) setReminders(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update({
            title: formData.title,
            due_date: formData.due_date,
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category
          })
          .eq('id', editingReminder.id);

        if (error) throw error;
        setEditingReminder(null);
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert([{
            title: formData.title,
            due_date: formData.due_date,
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category
          }]);

        if (error) throw error;
      }

      await fetchReminders();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      due_date: reminder.due_date.split('T')[0],
      amount: reminder.amount,
      description: reminder.description || '',
      category: reminder.category || 'bill'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchReminders();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      due_date: '',
      amount: '',
      description: '',
      category: 'bill'
    });
    setEditingReminder(null);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const getRemindersForDate = (date) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.due_date);
      return reminderDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-gray-600"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center ml-4">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Money</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Reminders</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="px-4 py-2 bg-white rounded-lg shadow flex items-center gap-2"
            >
              {viewMode === 'list' ? <Calendar size={20} /> : <List size={20} />}
              {viewMode === 'list' ? 'Calendar View' : 'List View'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow flex items-center gap-2"
            >
              <Plus size={20} />
              Add Reminder
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-2 py-1 rounded text-sm ${
                        reminder.category === 'bill' ? 'bg-blue-100 text-blue-700' :
                        reminder.category === 'subscription' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {reminder.category}
                    </span>
                    <h3 className="font-semibold">{reminder.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(reminder.due_date).toLocaleDateString()}
                  </p>
                  {reminder.description && (
                    <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">${parseFloat(reminder.amount).toFixed(2)}</span>
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {reminders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No reminders yet. Add one to get started!
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold py-2">
                  {day}
                </div>
              ))}
              {(() => {
                const { daysInMonth, firstDayOfMonth } = getDaysInMonth(selectedDate);
                const days = [];
                
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(
                    <div key={`empty-${i}`} className="p-2 min-h-[100px]" />
                  );
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dayReminders = getRemindersForDate(date);
                  
                  days.push(
                    <div 
                      key={day}
                      className={`p-2 border rounded-lg min-h-[100px] ${
                        date.toDateString() === new Date().toDateString() 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="font-semibold mb-2">{day}</div>
                      <div className="space-y-1">
                        {dayReminders.map(reminder => (
                          <div 
                            key={reminder.id}
                            className="text-sm p-1 rounded bg-purple-100 text-purple-700 cursor-pointer"
                            onClick={() => handleEdit(reminder)}
                          >
                            {reminder.title} - ${parseFloat(reminder.amount).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="bill">Bill</option>
                    <option value="subscription">Subscription</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingReminder ? 'Save Changes' : 'Add Reminder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderPage;