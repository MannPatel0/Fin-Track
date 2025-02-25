# Fin Track

## Introduction
Fin Track is a financial tracking application that helps users stay on top of their banking information at a glance. With a physical display showing real-time bank status, balance, transactions, and savings, users can keep their finances always visible. Additionally, the app allows users to set reminders for recurring payments and engage in interactive quizzes to enhance their financial literacy.
![DemoImage1](Assets/Demo1.jpg)]

## How to Run

### 1. Clone the Repository
```bash
git clone https://github.com/mannpatel0/fin-track.git
cd fin-track
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend server:
   ```bash
   node index.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend:
   ```bash
   npm run dev
   ```

### 4. Setting Up the Physical Display (Arduino)
1. Connect your Arduino to your computer.
2. Open `fintrack_display.ino` in Arduino IDE.
3. Upload the script to the Arduino board.
4. Ensure the board is communicating properly via serial port.
5. Run the display API:
   ```bash
   python3 Display_API.py
   ```

