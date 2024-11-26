// FlashcardApp.jsx
import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

export interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardAppProps {
  flashcards: Flashcard[];
  onFlashcardClick: () => void; // Add this prop to handle flashcard click event
}

const FlashcardComponent: React.FC<{
  flashcard: Flashcard;
  onStar: () => void;
  isStarred: boolean;
  onClick: () => void;
}> = ({ flashcard, onStar, isStarred, onClick }) => {
  const [flipped, setFlipped] = useState(false);
  const [isIconHovered, setIsIconHovered] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
    // onClick(); // Removed this line
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        margin: '20px auto',
        minHeight: '150px',
        width: '300px',
        backgroundColor: '#95c7f5',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent flip when clicking the star
            onStar();
            onClick(); // Call the onClick prop when the star is clicked
          }}
          onMouseEnter={() => setIsIconHovered(true)}
          onMouseLeave={() => setIsIconHovered(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
          title={isStarred ? 'Unstar this flashcard' : 'Star this flashcard'}
          aria-label={isStarred ? 'Unstar this flashcard' : 'Star this flashcard'}
        >
          {isStarred || isIconHovered ? (
            <FaStar color="gold" />
          ) : (
            <FaRegStar color="gray" />
          )}
        </button>
      </div>
      <div
        onClick={handleFlip}
        style={{
          cursor: 'pointer',
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          textAlign: 'center',
          padding: '10px',
        }}
      >
        {flipped ? flashcard.answer : flashcard.question}
      </div>
    </div>
  );
};

export const FlashcardApp: React.FC<FlashcardAppProps> = ({ flashcards, onFlashcardClick }) => {
  const [starredIndices, setStarredIndices] = useState<Set<number>>(new Set());
  const [unstarredIndices, setUnstarredIndices] = useState<number[]>([]);
  const [currentIndexUnstarred, setCurrentIndexUnstarred] = useState(0);
  const [showRetake, setShowRetake] = useState(false);

  // Initialize unstarredIndices when the component mounts or flashcards change
  useEffect(() => {
    setUnstarredIndices(flashcards.map((_, index) => index));
    setCurrentIndexUnstarred(0); // Reset current index
    setShowRetake(false); // Reset retake prompt
    setStarredIndices(new Set()); // Reset starred indices
  }, [flashcards]);

  useEffect(() => {
    if (unstarredIndices.length === 0) {
      setShowRetake(true);
    } else {
      // Ensure currentIndexUnstarred is within bounds
      if (currentIndexUnstarred >= unstarredIndices.length) {
        setCurrentIndexUnstarred(0);
      }
    }
  }, [unstarredIndices.length, currentIndexUnstarred]);

  const handlePrev = () => {
    if (unstarredIndices.length === 0) return;
    setCurrentIndexUnstarred((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : unstarredIndices.length - 1
    );
  };

  const handleNext = () => {
    if (unstarredIndices.length === 0) return;
    setCurrentIndexUnstarred((prevIndex) =>
      (prevIndex + 1) % unstarredIndices.length
    );
  };

  const handleStar = () => {
    const currentFlashcardIndex = unstarredIndices[currentIndexUnstarred];
    setStarredIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentFlashcardIndex);
      return newSet;
    });

    // Remove current index from unstarredIndices
    setUnstarredIndices((prev) =>
      prev.filter((index) => index !== currentFlashcardIndex)
    );

    // Adjust currentIndexUnstarred if needed
    setCurrentIndexUnstarred((prevIndex) => {
      if (prevIndex >= unstarredIndices.length - 1) {
        return 0;
      } else {
        return prevIndex;
      }
    });
  };

  const handleRetake = () => {
    setStarredIndices(new Set());
    setUnstarredIndices(flashcards.map((_, index) => index));
    setCurrentIndexUnstarred(0);
    setShowRetake(false);
  };

  if (flashcards.length === 0) {
    return <p>No flashcards available.</p>;
  }

  if (showRetake) {
    return (
      <div className="mt-4 text-left p-4 bg-white shadow-lg">
        <h2>You've completed all flashcards! Would you like to retake the session?</h2>
        <p>
        </p>
        <button
          onClick={handleRetake}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Retake Flashcards
        </button>
      </div>
    );
  }

  // **Added check before accessing currentFlashcardIndex**
  if (unstarredIndices.length === 0) {
    // This should not happen because showRetake would be true, but just in case
    return null;
  }

  const currentFlashcardIndex = unstarredIndices[currentIndexUnstarred];
  const currentFlashcard = flashcards[currentFlashcardIndex];

  if (!currentFlashcard) {
    // Safeguard against undefined flashcard
    return null;
  }

  return (
    <div className="flashcard-carousel">
      <FlashcardComponent
        flashcard={currentFlashcard} 
        onClick={onFlashcardClick} // No change here
        onStar={handleStar}
        isStarred={starredIndices.has(currentFlashcardIndex)}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
        }}
      >
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
      <div className="mt-2 text-center">
        Flashcard {currentIndexUnstarred + 1} of {unstarredIndices.length}
      </div>
    </div>
  );
};

export default FlashcardApp;
