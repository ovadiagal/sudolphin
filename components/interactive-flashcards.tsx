import React, { useState } from 'react';

export interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardAppProps {
  flashcards: Flashcard[];
  onFlashcardClick: () => void; // Add this prop to handle flashcard click event
}

const FlashcardComponent: React.FC<{ flashcard: Flashcard; onClick: () => void }> = ({ flashcard, onClick }) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(!flipped);
    onClick(); // Call the onClick prop when the flashcard is clicked
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        margin: '20px auto',
        cursor: 'pointer',
        textAlign: 'center',
        minHeight: '150px',
        width: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        userSelect: 'none',
        backgroundColor: '#95c7f5',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      {flipped ? flashcard.answer : flashcard.question}
    </div>
  );
};

export const FlashcardApp: React.FC<FlashcardAppProps> = ({ flashcards, onFlashcardClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex < flashcards.length - 1 ? prevIndex + 1 : 0));
  };

  if (!flashcards || flashcards.length === 0) {
    return <p>No flashcards available.</p>;
  }

  return (
    <div className="flashcard-carousel">
      <FlashcardComponent flashcard={flashcards[currentIndex]} onClick={onFlashcardClick} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
        <button
          onClick={handlePrev}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          &larr; Previous
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};

export default FlashcardApp;