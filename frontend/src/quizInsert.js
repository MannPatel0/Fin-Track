// quizInsert.js
import { supabase } from './supabaseClient';

const quizQuestions = [
  {
    category: "Banking",
    question: "What is compound interest?",
    options: [
      "Interest earned on the initial deposit only",
      "Interest earned on both the initial deposit and previously earned interest",
      "A fee charged by banks for loans",
      "A one-time interest payment on savings"
    ],
    correct_answer: 1,
    explanation: "Compound interest is calculated on both the principal amount and accumulated interest over time."
  },
  {
    category: "Banking",
    question: "Which of the following negatively impacts your credit score?",
    options: [
      "Paying credit card bills on time",
      "Having multiple credit cards",
      "Missing loan payments",
      "Checking your credit score"
    ],
    correct_answer: 2,
    explanation: "Missing loan or credit payments lowers your credit score as it reflects poor financial responsibility."
  },
  {
    category: "Investment",
    question: "What is diversification in investing?",
    options: [
      "Putting all money in one stock",
      "Spreading investments across different assets",
      "Only investing in bonds",
      "Only investing in real estate"
    ],
    correct_answer: 1,
    explanation: "Diversification means spreading investments across different assets to reduce risk."
  },
  {
    category: "Budgeting",
    question: "What is the 50/30/20 budgeting rule?",
    options: [
      "50% needs, 30% wants, 20% savings",
      "50% savings, 30% needs, 20% wants",
      "50% wants, 30% savings, 20% needs",
      "50% needs, 30% savings, 20% wants"
    ],
    correct_answer: 0,
    explanation: "The 50/30/20 rule suggests spending 50% of income on needs, 30% on wants, and 20% on savings."
  }
];

const initializeQuizDatabase = async () => {
  try {
    // Check if questions already exist
    const { data: existing, error: checkError } = await supabase
      .from('quiz_questions')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    // If no questions exist, insert them
    if (!existing || existing.length === 0) {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(quizQuestions)
        .select();

      if (error) throw error;

      console.log('Quiz questions initialized successfully');
      return { success: true, data };
    }

    console.log('Quiz questions already exist');
    return { success: true, data: existing };

  } catch (error) {
    console.error('Error initializing quiz database:', error);
    return { success: false, error };
  }
};

export { initializeQuizDatabase };