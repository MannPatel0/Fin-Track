import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaid } from '../PlaidProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ChevronLeft } from 'lucide-react';


const ExpenseTracker = () => {
  const navigate = useNavigate();
  const { 
    accessToken, 
    accounts, 
    transactions, 
    loading, 
    error,
    initializePlaidLink,
    fetchTransactions 
  } = usePlaid();

  // Process transactions for chart data
  const processTransactionsForChart = (transactions) => {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    ).map(transaction => ({
      date: new Date(transaction.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      amount: transaction.amount,
      name: transaction.merchant_name || transaction.name,
      category: transaction.category ? transaction.category[0] : 'Uncategorized'
    }));

    return sortedTransactions;
  };

  const chartData = processTransactionsForChart(transactions);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded border">
          <p className="text-sm text-gray-600">{data.date}</p>
          <p className="font-bold">{data.name}</p>
          <p className={`font-medium ${data.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(data.amount).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">{data.category}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading your financial data...</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Connect Your Bank Account</h2>
        <button
          onClick={initializePlaidLink}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Connect Account
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="ml-2 text-xl font-bold text-gray-900">Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20">
        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {accounts.map(account => (
            <div key={account.account_id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <p className="text-gray-600">{account.subtype}</p>
              <p className="text-xl mt-2">
                ${account.balances.current.toFixed(2)}
                {account.balances.available && (
                  <span className="text-sm text-gray-500 ml-2">
                    (${account.balances.available.toFixed(2)} available)
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Transaction Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ angle: -45 }} 
                textAnchor="end" 
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                dot={{ 
                  stroke: (entry) => entry.amount > 0 ? '#ef4444' : '#22c55e',
                  fill: (entry) => entry.amount > 0 ? '#ef4444' : '#22c55e',
                  r: 4
                }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold">Recent Transactions</h3>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.merchant_name || transaction.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category ? transaction.category[0] : 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;