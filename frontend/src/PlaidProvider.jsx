import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const PlaidContext = createContext();

export const PlaidProvider = ({ children }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing access token on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has an access token in Supabase
      const { data: plaidData, error } = await supabase
        .from('plaid_connections')
        .select('access_token')
        .eq('user_id', user.id)
        .single();

      if (plaidData?.access_token) {
        setAccessToken(plaidData.access_token);
        await fetchTransactions(plaidData.access_token);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error checking existing connection:', err);
      setLoading(false);
    }
  };

  const initializePlaidLink = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Create link token
      const response = await fetch('http://localhost:3000/api/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await response.json();
      setLinkToken(data.link_token);

      // Load Plaid script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        script.async = true;
        script.onload = () => {
          const handler = window.Plaid.create({
            token: data.link_token,
            onSuccess: async (public_token, metadata) => {
              try {
                const response = await fetch('http://localhost:3000/api/exchange_public_token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ public_token })
                });
                const data = await response.json();
                
                // Save access token to Supabase
                await supabase
                  .from('plaid_connections')
                  .upsert({ 
                    user_id: user.id, 
                    access_token: data.access_token,
                    item_id: data.item_id
                  });

                setAccessToken(data.access_token);
                await fetchTransactions(data.access_token);
                resolve();
              } catch (err) {
                setError('Failed to connect to bank');
                reject(err);
              }
            },
            onExit: (err, metadata) => {
              if (err) setError('Connection process interrupted');
              setLoading(false);
              reject(err);
            },
          });
          handler.open();
        };
        document.head.appendChild(script);
      });
    } catch (err) {
      setError('Failed to initialize bank connection');
      setLoading(false);
      throw err;
    }
  };

  const fetchTransactions = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/transactions', {
        headers: { 'plaid-access-token': token || accessToken }
      });
      const data = await response.json();
      setTransactions(data.transactions);
      setAccounts(data.accounts || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  const value = {
    linkToken,
    accessToken,
    accounts,
    transactions,
    loading,
    error,
    initializePlaidLink,
    fetchTransactions,
  };

  return (
    <PlaidContext.Provider value={value}>
      {children}
    </PlaidContext.Provider>
  );
};

export const usePlaid = () => {
  const context = useContext(PlaidContext);
  if (context === undefined) {
    throw new Error('usePlaid must be used within a PlaidProvider');
  }
  return context;
};