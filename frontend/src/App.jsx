import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, DollarSign, Home, Calendar, ChevronRight, Building, CreditCard, MessageSquare, LogOut, FileText } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import ReminderWidget from './components/ReminderWidget';
import ReminderPage from './pages/ReminderPage'
import QuizPage from './pages/QuizPage';
import ExpenseTracker from './pages/ExpenceTracker';
import { PlaidProvider } from './PlaidProvider';
import { usePlaid } from './PlaidProvider';  // Import the usePlaid hook




// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Auth hook
const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session,
  };
};

// Login Component
const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="default"
        />
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const navigate = useNavigate();
  const { accounts, transactions, loading } = usePlaid();  // Use the Plaid context
  const [reminders, setReminders] = useState([]);

  // Process Plaid data for charts
  const processChartData = () => {
    if (!transactions?.length) return [];

    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = transaction.date.substring(0, 7); // Get YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, spending: 0, savings: 0 };
      }
      
      // Amount > 0 is spending, < 0 is income in Plaid
      if (transaction.amount > 0) {
        acc[month].spending += transaction.amount;
      } else {
        acc[month].income += Math.abs(transaction.amount);
      }
      
      // Calculate savings
      acc[month].savings = acc[month].income - acc[month].spending;
      
      return acc;
    }, {});

    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
      .map(data => ({
        ...data,
        month: new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short' })
      }));
  };

  const chartData = processChartData();

  // Show loading state if Plaid data is still loading
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Financial Overview Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Income Graph */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Income</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Income']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#4CAF50" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Graph */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Spending']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="spending" fill="#FF5722" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings Graph */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Savings</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Savings']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#2196F3"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <ReminderWidget/>
        {/* Apartment Finder Card */}


        {/* Expense Tracker Card */}
        <div 
          onClick={() => navigate('/expenses')}
          className="bg-white rounded-lg shadow transition-all hover:shadow-lg cursor-pointer p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Track Expenses</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600">Monitor your spending and manage your budget</p>
        </div>

        {/* Quizzes Card */}
        <div 
          onClick={() => navigate('/quizzes')}
          className="bg-white rounded-lg shadow transition-all hover:shadow-lg cursor-pointer p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Financial Quizzes</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-600">Test your financial knowledge and learn new skills</p>
        </div>
        
      </div>
    <div>
      <footer className="bg-gray-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4">FinTrack</h4>
            <p className="text-gray-600 text-sm">
              Your personal financial management and tracking solution.
            </p>
          </div>
          </div>
          </footer>
          </div></div>

  );
};

// Layout Component with Navigation Context
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const name = user.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    getUser();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Fin Track</span>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-6">
              <span className="text-gray-600">Hi, {userName}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:text-red-600 flex items-center gap-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for navbar */}
      <div className="max-w-7xl mx-auto px-4 pt-20">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Component
const App = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900">
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <PlaidProvider>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/reminders" 
            element={
              <ProtectedRoute>
                <ReminderPage />
              </ProtectedRoute> 
          }/>
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute>
                <ExpenseTracker />
              </ProtectedRoute> 
          }/>
          <Route 
            path="/quizzes" 
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute> 
          }/>
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardContent />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Other routes */}
        </Routes>
        </PlaidProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;