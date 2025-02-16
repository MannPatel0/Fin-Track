// QuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Award } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { initializeQuizDatabase } from '../quizInsert';

const QuizPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initializationStatus, setInitializationStatus] = useState('');

  useEffect(() => {
    initializeAndFetchQuizzes();
  }, []);

  const initializeAndFetchQuizzes = async () => {
    try {
      setLoading(true);
      setInitializationStatus('Initializing quiz database...');
      
      const initResult = await initializeQuizDatabase();
      if (!initResult.success) {
        throw new Error('Failed to initialize quiz database');
      }
      
      setInitializationStatus('Fetching quizzes...');
      await fetchQuizzes();
      
      setInitializationStatus('');
      setLoading(false);
    } catch (error) {
      console.error('Error initializing quizzes:', error);
      setInitializationStatus('Error loading quizzes. Please try again.');
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data: quizData, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('id');

      if (error) throw error;

      const groupedQuizzes = quizData.reduce((acc, question) => {
        if (!acc[question.category]) {
          acc[question.category] = {
            title: question.category,
            description: `Test your knowledge about ${question.category}`,
            questions: []
          };
        }
        acc[question.category].questions.push({
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_answer,
          explanation: question.explanation
        });
        return acc;
      }, {});

      setQuizzes(Object.values(groupedQuizzes));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex + 1 < currentQuiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('quiz_results').insert({
            user_id: user.id,
            quiz_category: currentQuiz.title,
            score: score + (selectedAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer ? 1 : 0),
            total_questions: currentQuiz.questions.length,
            completed_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          {initializationStatus && (
            <p className="text-gray-600">{initializationStatus}</p>
          )}
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold mb-2">Knowledge Quiz</h1>
              <p className="text-gray-600">Select a quiz to test your knowledge</p>
            </div>

            <div className="space-y-6">
              {quizzes.map((quiz, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="mt-4 bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              ))}
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