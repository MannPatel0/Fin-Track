// QuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, BookOpen, Award, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const QuizPage = () => {
  const navigate = useNavigate();
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Sample quiz data - Replace with Supabase data
  const quizzes = [
    {
      id: 1,
      title: "Banking & Finance Essentials",
      description: "Understand the key concepts of personal finance and banking.",
      questions: [
        {
          question: "What is compound interest?",
          options: [
            "Interest earned on the initial deposit only",
            "Interest earned on both the initial deposit and previously earned interest",
            "A fee charged by banks for loans",
            "A one-time interest payment on savings"
          ],
          correctAnswer: 1,
          explanation: "Compound interest is calculated on both the principal amount and accumulated interest over time."
        },
        {
          question: "Which of the following negatively impacts your credit score?",
          options: [
            "Paying credit card bills on time",
            "Having multiple credit cards",
            "Missing loan payments",
            "Checking your credit score"
          ],
          correctAnswer: 2,
          explanation: "Missing loan or credit payments lowers your credit score as it reflects poor financial responsibility."
        },
        {
          question: "What is the primary purpose of a credit score?",
          options: [
            "To determine your annual tax rate",
            "To assess your trustworthiness as a borrower",
            "To calculate your net worth",
            "To set your bank account interest rate"
          ],
          correctAnswer: 1,
          explanation: "A credit score helps lenders assess your creditworthiness before approving loans or credit cards."
        },
        {
          question: "Which financial tool helps you save money on unnecessary expenses?",
          options: [
            "A budgeting app",
            "A credit card",
            "A payday loan",
            "A lottery ticket"
          ],
          correctAnswer: 0,
          explanation: "Budgeting apps help track expenses and reduce unnecessary spending."
        },
        {
          question: "What is an overdraft fee?",
          options: [
            "A fee for depositing money in your bank",
            "A penalty for withdrawing more money than you have in your account",
            "A charge for opening a new bank account",
            "A bonus for using your debit card frequently"
          ],
          correctAnswer: 1,
          explanation: "An overdraft fee is charged when you spend more than what is available in your account."
        },
        {
          question: "What does APR stand for?",
          options: [
            "Annual Percentage Rate",
            "Average Payment Ratio",
            "Automated Payment Record",
            "Account Processing Report"
          ],
          correctAnswer: 0,
          explanation: "APR (Annual Percentage Rate) represents the cost of borrowing, including interest and fees."
        }
      ]
    },
    {
      id: 2,
      title: "Insurance & Healthcare Knowledge",
      description: "Learn about insurance and healthcare essentials.",
      questions: [
        {
          question: "Which type of insurance helps cover the cost of medical expenses?",
          options: [
            "Home insurance",
            "Health insurance",
            "Auto insurance",
            "Travel insurance"
          ],
          correctAnswer: 1,
          explanation: "Health insurance covers medical expenses, including doctor visits, hospital stays, and medications."
        },
        {
          question: "What is a deductible in an insurance policy?",
          options: [
            "A discount offered for early payments",
            "The amount you pay out-of-pocket before insurance kicks in",
            "The total coverage amount of an insurance policy",
            "The fine print in an insurance contract"
          ],
          correctAnswer: 1,
          explanation: "A deductible is the amount you must pay before your insurance starts covering expenses."
        },
        {
          question: "What does ‘premium’ mean in an insurance policy?",
          options: [
            "The total amount covered by the policy",
            "The amount you pay for insurance coverage, usually monthly or yearly",
            "A special discount given to policyholders",
            "A type of investment plan"
          ],
          correctAnswer: 1,
          explanation: "A premium is the regular payment you make to keep your insurance policy active."
        },
        {
          question: "Which of the following is NOT typically covered by standard health insurance?",
          options: [
            "Doctor visits",
            "Prescription medication",
            "Cosmetic surgery",
            "Emergency room visits"
          ],
          correctAnswer: 2,
          explanation: "Cosmetic surgery is usually not covered unless it is medically necessary."
        },
        {
          question: "What does life insurance primarily provide?",
          options: [
            "Coverage for medical expenses",
            "Financial support for dependents after the policyholder’s death",
            "Investment opportunities",
            "Legal protection against lawsuits"
          ],
          correctAnswer: 1,
          explanation: "Life insurance provides financial security to the policyholder’s beneficiaries in the event of death."
        }
      ]
    },
    {
      id: 3,
      title: "Food Safety & Consumer Awareness",
      description: "Stay informed about food safety and smart consumer choices.",
      questions: [
        {
          question: "Which of the following should you NOT do to prevent food poisoning?",
          options: [
            "Wash your hands before preparing food",
            "Leave perishable food at room temperature for hours",
            "Store raw meat separately from cooked food",
            "Cook meat to the proper internal temperature"
          ],
          correctAnswer: 1,
          explanation: "Leaving perishable food at room temperature can lead to bacterial growth and foodborne illnesses."
        },
        {
          question: "What does the expiration date on food packaging indicate?",
          options: [
            "The last day the food should be sold",
            "The date after which the food is unsafe to eat",
            "The best quality before a certain date, but it may still be safe after",
            "A suggestion for when to buy new food"
          ],
          correctAnswer: 2,
          explanation: "Expiration dates often indicate peak freshness, but many foods are still safe to consume after this date."
        },
        {
          question: "Which of the following is the safest way to thaw frozen food?",
          options: [
            "Leaving it on the kitchen counter",
            "Placing it in the refrigerator overnight",
            "Soaking it in hot water",
            "Leaving it under direct sunlight"
          ],
          correctAnswer: 1,
          explanation: "Refrigerator thawing is the safest method as it prevents bacterial growth."
        },
        {
          question: "What temperature should poultry be cooked to in order to ensure food safety?",
          options: [
            "120°F (49°C)",
            "145°F (63°C)",
            "165°F (74°C)",
            "200°F (93°C)"
          ],
          correctAnswer: 2,
          explanation: "Poultry should be cooked to at least 165°F (74°C) to kill harmful bacteria."
        },
        {
          question: "Which of these common kitchen habits increases the risk of cross-contamination?",
          options: [
            "Using separate cutting boards for meat and vegetables",
            "Washing hands after handling raw food",
            "Using the same knife for raw chicken and fresh vegetables without washing it",
            "Refrigerating leftovers within two hours"
          ],
          correctAnswer: 2,
          explanation: "Using the same knife for raw meat and vegetables without washing it can transfer harmful bacteria."
        }
      ]
    }
  ];  

  const handleStartQuiz = () => {
    setCurrentQuiz(quizzes[0]);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    // Calculate score
    if (selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    // Move to next question or show results
    if (currentQuestionIndex + 1 < currentQuiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
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
              <BookOpen className="h-6 w-6 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Financial Education</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pt-20">
        {!quizStarted ? (
          // Quiz Selection Screen
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Financial Independence Quiz</h1>
              <p className="text-gray-600">Test your knowledge and learn about personal finance</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Budgeting Basics</h3>
                  <p className="text-sm text-gray-600 mt-1">Learn the fundamentals of personal budgeting and financial planning</p>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full bg-purple-600 text-white rounded-lg py-3 font-medium hover:bg-purple-700 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : showResult ? (
          // Results Screen
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                {score === currentQuiz.questions.length ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Award className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-10 w-10 text-purple-600" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-gray-600 mb-6">
                You scored {score} out of {currentQuiz.questions.length}
              </p>
              <button
                onClick={() => setQuizStarted(false)}
                className="bg-purple-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-purple-700 transition-colors"
              >
                Try Another Quiz
              </button>
            </div>
          </div>
        ) : (
          // Quiz Questions Screen
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{currentQuiz.title}</h2>
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">
                {currentQuiz.questions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedAnswer === null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {currentQuestionIndex + 1 === currentQuiz.questions.length ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;