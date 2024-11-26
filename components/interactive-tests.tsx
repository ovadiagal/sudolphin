import React, { useState, useEffect } from 'react';

interface Option {
  label: string;
  text: string;
}

interface Question {
  question: string;
  options: Option[];
  correctAnswer: string; // The label of the correct answer, e.g., 'A', 'B', 'C', 'D'
}

interface TestAppProps {
  tests: { fileName: string; content: string }[];
}

export const TestApp: React.FC<TestAppProps> = ({ tests }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [testName, setTestName] = useState('');
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    if (tests && tests.length > 0) {
      const allQuestions: Question[] = [];

      tests.forEach((test) => {
        const content = test.content;
        setTestName(test.fileName);

        // Split the content by '---' to get individual questions
        const entries = content.split('---');

        entries.forEach((entry) => {
          const trimmedEntry = entry.trim();
          if (trimmedEntry) {
            // Extract question
            const questionMatch = trimmedEntry.match(/^\d+\.\s*(.+)$/m);
            if (!questionMatch) return;

            const questionText = questionMatch[1].trim();

            // Extract options using RegExp.exec()
            const optionsRegex = /^([A-D])\)\s*(.+)$/gm;
            let optionMatch: RegExpExecArray | null;
            const options: Option[] = [];

            while ((optionMatch = optionsRegex.exec(trimmedEntry)) !== null) {
              options.push({
                label: optionMatch[1], // 'A', 'B', 'C', or 'D'
                text: optionMatch[2].trim(),
              });
            }

            // Extract correct answer
            const correctAnswerMatch = trimmedEntry.match(/Correct answer:\s*([A-D])/m);
            if (!correctAnswerMatch) return;

            const correctAnswerLabel = correctAnswerMatch[1];

            allQuestions.push({
              question: questionText,
              options,
              correctAnswer: correctAnswerLabel,
            });
          }
        });
      });

      setParsedQuestions(allQuestions);
    }
  }, [tests]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : parsedQuestions.length - 1
    );
  };

  const handleNext = () => {
    if (currentIndex < parsedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowModal(true);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setScore(0);
    setAttemptedQuestions(new Set());
    setShowModal(false);
    setShowScore(false);
  };

  const handleDismiss = () => {
    setShowModal(false);
    setShowScore(true);
  };

  if (!parsedQuestions || parsedQuestions.length === 0) {
    return <p>No questions available.</p>;
  }

  return (
    <div className="test-carousel">
      {!showScore ? (
        <>
          <TestComponent 
            question={parsedQuestions[currentIndex]} 
            onCorrectAnswer={() => {
              if (!attemptedQuestions.has(currentIndex)) {
                setScore(score + 1);
                setAttemptedQuestions(new Set(attemptedQuestions).add(currentIndex));
              }
            }}
          />
          <div className="flex justify-between mt-4">
            <button onClick={handlePrev} className="px-4 py-2 bg-gray-300 rounded">
              Previous
            </button>
            <button onClick={handleNext} className="px-4 py-2 bg-gray-300 rounded">
              Next
            </button>
          </div>
          <div className="mt-2 text-center">
            Question {currentIndex + 1} of {parsedQuestions.length}
          </div>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h1 className="text-2xl mb-4">Your Score: {score} / {parsedQuestions.length}</h1>
                <button onClick={handleDismiss} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
                  Dismiss
                </button>
                <button onClick={handleRetake} className="px-4 py-2 bg-green-500 text-white rounded">
                  Retake Test
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 text-left p-4 bg-white shadow-lg">
          <h2>{testName}</h2>
          <p>Your Score: {score} / {parsedQuestions.length}</p>
          <button onClick={handleRetake} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
            Retake Test
          </button>
        </div>
      )}
    </div>
  );
};

const TestComponent: React.FC<{ question: Question, onCorrectAnswer: () => void }> = ({ question, onCorrectAnswer }) => {
  const [selectedOptionLabel, setSelectedOptionLabel] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptionLabel(null);
    setShowAnswer(false);
  }, [question]);

  const handleOptionClick = (label: string) => {
    setSelectedOptionLabel(label);
    setShowAnswer(true);
    if (label === question.correctAnswer) {
      onCorrectAnswer();
    }
  };

  return (
    <div className="test-question border border-gray-300 p-4 m-2 rounded-lg shadow-md bg-white">
      <div className="text-lg font-medium mb-4">{question.question}</div>
      <div className="options space-y-2">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleOptionClick(option.label)}
            className={`block w-full text-left px-4 py-2 border rounded ${
              showAnswer && option.label === question.correctAnswer
                ? 'bg-green-100'
                : showAnswer && option.label === selectedOptionLabel
                ? 'bg-red-100'
                : 'bg-white'
            }`}
          >
            {option.label}) {option.text}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="mt-4">
          {selectedOptionLabel === question.correctAnswer ? (
            <p className="text-green-600">Correct!</p>
          ) : (
            <p className="text-red-600">
              Incorrect. The correct answer is: {question.correctAnswer}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
