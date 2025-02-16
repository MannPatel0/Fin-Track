const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Configure Plaid client
const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

// Create a link token
app.post('/api/create_link_token', async (req, res) => {
    try {
        const tokenRequest = {
            user: { client_user_id: req.body.userId || 'user-id' },
            client_name: 'user_good',
            products: ['auth', 'transactions'],
            country_codes: ['US', 'CA'],
            language: 'en'
        };

        console.log('Creating link token with request:', tokenRequest);
        const createTokenResponse = await plaidClient.linkTokenCreate(tokenRequest);
        console.log('Link token created:', createTokenResponse.data);
        res.json(createTokenResponse.data);
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({
            error: error.message,
            error_code: error.response?.data?.error_code,
            error_type: error.response?.data?.error_type
        });
    }
});

// Exchange public token for access token
app.post('/api/exchange_public_token', async (req, res) => {
    try {
        if (!req.body.public_token) {
            return res.status(400).json({
                error: 'Missing public_token in request body'
            });
        }

        console.log('Exchanging public token:', req.body.public_token);
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: req.body.public_token
        });

        console.log('Token exchange successful:', exchangeResponse.data);
        res.json({
            access_token: exchangeResponse.data.access_token,
            item_id: exchangeResponse.data.item_id,
        });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({
            error: error.message,
            error_code: error.response?.data?.error_code,
            error_type: error.response?.data?.error_type
        });
    }
});

// Get accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const accessToken = req.headers['plaid-access-token'];
        
        if (!accessToken) {
            return res.status(400).json({
                error: 'Missing access_token in request headers'
            });
        }

        console.log('Getting accounts for access token:', accessToken);
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });

        console.log('Got accounts:', accountsResponse.data);
        res.json(accountsResponse.data);
    } catch (error) {
        console.error('Error getting accounts:', error);
        res.status(500).json({
            error: error.message,
            error_code: error.response?.data?.error_code,
            error_type: error.response?.data?.error_type
        });
    }
});

// Get transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const accessToken = req.headers['plaid-access-token'];
        
        if (!accessToken) {
            return res.status(400).json({
                error: 'Missing access_token in request headers'
            });
        }

        // Get current date and date 30 days ago
        const endDate = new Date().toISOString().slice(0, 10);
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        console.log('Getting transactions for access token:', accessToken);
        
        // Initial request
        const request = {
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate,
            options: {
                include_personal_finance_category: true,
                count: 100,
                offset: 0
            }
        };

        let allTransactions = [];
        const response = await plaidClient.transactionsGet(request);
        let transactions = response.data.transactions;
        const total_transactions = response.data.total_transactions;
        allTransactions = allTransactions.concat(transactions);

        // Handle pagination if there are more transactions
        while (allTransactions.length < total_transactions) {
            const paginatedRequest = {
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
                options: {
                    include_personal_finance_category: true,
                    count: 100,
                    offset: allTransactions.length
                }
            };
            const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest);
            allTransactions = allTransactions.concat(paginatedResponse.data.transactions);
        }

        console.log(`Got ${allTransactions.length} transactions`);
        res.json({
            transactions: allTransactions,
            accounts: response.data.accounts,
            item: response.data.item,
            total_transactions: total_transactions,
            request_id: response.data.request_id
        });
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({
            error: error.message,
            error_code: error.response?.data?.error_code,
            error_type: error.response?.data?.error_type
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});