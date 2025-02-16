#include <LiquidCrystal.h>
#include <ArduinoJson.h>

// LCD Pin Configuration
LiquidCrystal lcd(14, 27, 26, 25, 33, 32);

// JSON parsing buffer
StaticJsonDocument<2048> jsonDoc;

// Financial tracking structures
struct FinancialSummary {
  float bankBalance;
  float totalIncome;
  float totalExpenses;
  float netAmount;
  int transactionCount;
};

FinancialSummary financialData = {0, 0, 0, 0, 0};

// Display states
enum DisplayState {
  BANK_BALANCE,
  INCOME_EXPENSES,
  TRANSACTION_COUNT
};
DisplayState currentState = BANK_BALANCE;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.clear();
  
  // Display startup message
  lcd.setCursor(0, 0);
  lcd.print("Finance Tracker");
  lcd.setCursor(0, 1);
  lcd.print("Waiting for Data");
}

void parseFinancialData(String jsonString) {
  // Reset financial data
  financialData = {0, 0, 0, 0, 0};
  
  // Parse JSON
  DeserializationError error = deserializeJson(jsonDoc, jsonString);
  
  if (error) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("JSON Error");
    
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    return;
  }
  
  // Parse financial data
  financialData.bankBalance = jsonDoc["bank_balance"].as<float>();
  financialData.totalIncome = jsonDoc["total_income"].as<float>();
  financialData.totalExpenses = jsonDoc["total_expenses"].as<float>();
  financialData.netAmount = jsonDoc["net_amount"].as<float>();
  
  // Parse transaction count
  JsonArray transactions = jsonDoc["recent_transactions"].as<JsonArray>();
  financialData.transactionCount = transactions.size();
  
  // Display initial information
  displayFinancialInfo();
}

void displayFinancialInfo() {
  // Cycle through different display states
  switch (currentState) {
    case BANK_BALANCE:
      displayBankBalance();
      break;
    case INCOME_EXPENSES:
      displayIncomeExpenses();
      break;
    case TRANSACTION_COUNT:
      displayTransactionCount();
      break;
  }
  
  // Rotate to next state
  currentState = static_cast<DisplayState>((currentState + 1) % 3);
}

void displayBankBalance() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Bank Balance:");
  lcd.setCursor(0, 1);
  lcd.print("$");
  lcd.print(financialData.bankBalance, 2);
}

void displayIncomeExpenses() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Income: $");
  lcd.print(financialData.totalIncome, 2);
  lcd.setCursor(0, 1);
  lcd.print("Expense: $");
  lcd.print(financialData.totalExpenses, 2);
}

void displayTransactionCount() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Transactions:");
  lcd.setCursor(0, 1);
  lcd.print("Total: ");
  lcd.print(financialData.transactionCount);
}

void loop() {
  // Check for incoming serial data
  if (Serial.available()) {
    String receivedData = Serial.readStringUntil('\n');
    
    // Attempt to parse received JSON
    parseFinancialData(receivedData);
  }
  
  // Display rotation every 3 seconds
  static unsigned long lastDisplayTime = 0;
  unsigned long currentTime = millis();
  
  if (currentTime - lastDisplayTime >= 3000) {
    displayFinancialInfo();
    lastDisplayTime = currentTime;
  }
}