import serial
import json
import requests
import time
from datetime import datetime, timedelta

class PlaidDataSender:
    def __init__(self, access_token, serial_port='/dev/tty.usbserial-0001', baud_rate=115200):
        self.access_token = access_token
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.api_base_url = 'http://localhost:3000'

    def fetch_financial_data(self):
        """Fetch real financial data from Plaid API"""
        headers = {'plaid-access-token': self.access_token}
        
        # Fetch accounts
        accounts_response = requests.get(
            f'{self.api_base_url}/api/accounts', 
            headers=headers
        )
        accounts_data = accounts_response.json()
        
        # Fetch transactions
        transactions_response = requests.get(
            f'{self.api_base_url}/api/transactions', 
            headers=headers
        )
        transactions_data = transactions_response.json()

        # Calculate totals
        total_balance = sum(account['balances']['current'] for account in accounts_data['accounts'])
        transactions = transactions_data['transactions']
        total_income = sum(trans['amount'] for trans in transactions if trans['amount'] > 0)
        total_expenses = sum(trans['amount'] for trans in transactions if trans['amount'] < 0)

        # Format data for ESP32
        financial_summary = {
            "bank_balance": round(total_balance, 2),
            "total_income": round(total_income, 2),
            "total_expenses": round(abs(total_expenses), 2),
            "net_amount": round(total_income + total_expenses, 2),
            "recent_transactions": [
                {
                    "name": trans['merchant_name'] or trans['name'],
                    "amount": trans['amount'],
                    "type": "income" if trans['amount'] > 0 else "expense",
                    "date": trans['date']
                }
                for trans in sorted(transactions, key=lambda x: x['date'], reverse=True)[:5]
            ]
        }

        return financial_summary

    def run(self):
        """Run the data sender"""
        try:
            # Setup serial connection
            with serial.Serial(self.serial_port, self.baud_rate, timeout=1) as ser:
                print(f"Connected to ESP32 on {self.serial_port}")
                time.sleep(2)  # Wait for connection to establish

                while True:
                    try:
                        # Fetch latest financial data
                        financial_data = self.fetch_financial_data()
                        
                        # Convert to JSON and send
                        json_data = json.dumps(financial_data)
                        ser.write((json_data + '\n').encode('utf-8'))
                        
                        print(f"Sent financial data: {json_data}")
                        time.sleep(10)  # Wait 5 seconds before next update
                        
                    except requests.RequestException as e:
                        print(f"API Error: {e}")
                        time.sleep(5)
                    except Exception as e:
                        print(f"Error sending data: {e}")
                        time.sleep(1)

        except serial.SerialException as e:
            print(f"Serial connection error: {e}")
        except KeyboardInterrupt:
            print("\nStopped by user")

def main():
    access_token = "access-sandbox-1331c29e-2e5a-492b-ac03-623c4a7aa146"
    sender = PlaidDataSender(
        access_token=access_token,
        serial_port='/dev/tty.usbserial-0001',
        baud_rate=115200
    )
    
    sender.run()

if __name__ == "__main__":
    main()
