"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { FilePreviewModal } from './file-preview-modal';
import { generateTest } from './generate-tests';
import { generateFlashCards } from './generate-flash-cards';
import { generateCribSheet } from './generate-crib-sheet';
import { FileUploadArea } from './FileUploadArea';
import { FileListItem } from './FileListItem';
import { GeneratedContent } from './GeneratedContent';
import { FlashcardApp, Flashcard } from './interactive-flashcards';
import { TestApp } from './interactive-tests';
import { FaTrash } from 'react-icons/fa';

interface FileObject {
  name: string;
  metadata: {
    size: number;
  };
  url?: string;
}

interface GeneratedItem {
  id?: number;
  fileName: string;
  content: string;
}

export default function FileGallery({ classId }: { classId: string }) {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [generatedTests, setGeneratedTests] = useState<GeneratedItem[]>([]);
  const [generatedFlashCards, setGeneratedFlashCards] = useState<GeneratedItem[]>([]);
  const [generatedCribSheets, setGeneratedCribSheets] = useState<GeneratedItem[]>([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState<number | null>(null);
  const [selectedFlashCardIndex, setSelectedFlashCardIndex] = useState<number | null>(null);
  const [selectedCribSheetIndex, setSelectedCribSheetIndex] = useState<number | null>(null);
  const [parsedFlashcards, setParsedFlashcards] = useState<Flashcard[]>([]);
  const [parsedTests, setParsedTests] = useState<GeneratedItem[]>([]);
  const [flashcardsClicked, setFlashcardsClicked] = useState(0);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const supabase = createClient();

  // Fetch files
  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from('class-files').list(`${classId}/`);

    if (error) {
      toast.error('Error loading files');
      return;
    }

    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from('class-files').getPublicUrl(`${classId}/${file.name}`);

        return {
          ...file,
          url: publicUrl,
        };
      })
    );

    const filteredFilesWithUrls = filesWithUrls.map((file) => ({
      ...file,
      metadata: { size: file.metadata.size },
    }));

    setFiles(filteredFilesWithUrls);
  };

  // Fetch generated content
  const fetchGeneratedContent = async () => {
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      toast.error('Error loading generated content');
      return;
    }

    const tests = data?.filter((item) => item.type === 'test') || [];
    const flashcards = data?.filter((item) => item.type === 'flashcard') || [];
    const cribsheets = data?.filter((item) => item.type === 'cribsheet') || [];

    setGeneratedTests(
      tests.map((item) => ({
        id: item.id,
        fileName: item.file_name,
        content: item.content,
      }))
    );

    setGeneratedFlashCards(
      flashcards.map((item) => ({
        id: item.id,
        fileName: item.file_name,
        content: item.content,
      }))
    );

    setGeneratedCribSheets(
      cribsheets.map((item) => ({
        id: item.id,
        fileName: item.file_name,
        content: item.content,
      }))
    );
  };

  // Fetch statistics from Supabase
  const fetchStatistics = async () => {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('flashcards_clicked, cumulative_score')
      .eq('user_id', classId)
      .single();

    if (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Error loading statistics');
      return;
    }

    if (data) {
      console.log('Fetched statistics:', data);
      setFlashcardsClicked(data.flashcards_clicked);
      setCumulativeScore(data.cumulative_score);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchGeneratedContent();
    fetchStatistics();
  }, [classId]);

  const handleFileClick = (file: FileObject) => {
    if (file.url) {
      setSelectedFile(file);
    }
  };

  const saveGeneratedContent = async (type: string, content: GeneratedItem) => {
    const { data, error } = await supabase
      .from('generated_content')
      .insert([{ class_id: classId, type, file_name: content.fileName, content: content.content }])
      .select();

    if (error) {
      toast.error('Error saving generated content');
    } else {
      const newItem = { id: data[0].id, fileName: content.fileName, content: content.content };
      if (type === 'test') {
        setGeneratedTests((prevTests) => [...prevTests, newItem]);
      } else if (type === 'flashcard') {
        setGeneratedFlashCards((prevFlashCards) => [...prevFlashCards, newItem]);
      } else if (type === 'cribsheet') {
        setGeneratedCribSheets((prevCribSheets) => [...prevCribSheets, newItem]);
      }
    }
  };

  const handleDeleteGeneratedContent = async (type: string, id: number) => {
    const { error } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting generated content');
    } else {
      if (type === 'test') {
        setGeneratedTests((prevTests) => prevTests.filter((item) => item.id !== id));
        setSelectedTestIndex(null);
      } else if (type === 'flashcard') {
        setGeneratedFlashCards((prevFlashCards) => prevFlashCards.filter((item) => item.id !== id));
        setSelectedFlashCardIndex(null);
      } else if (type === 'cribsheet') {
        setGeneratedCribSheets((prevCribSheets) => prevCribSheets.filter((item) => item.id !== id));
        setSelectedCribSheetIndex(null);
      }
    }
  };

  const handleGenerateTest = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Generating practice test...', {
      position: 'bottom-center',
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedTest = await generateTest(file.url, file.name);
      if (generatedTest) {
        await saveGeneratedContent('test', generatedTest);
      }
    }
    toast.dismiss();
  };

  const handleGenerateFlashCards = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Generating flash cards...', {
      position: 'bottom-center',
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedFlashCard = await generateFlashCards(file.url, file.name);
      if (generatedFlashCard) {
        await saveGeneratedContent('flashcard', generatedFlashCard);
      }
    }
    toast.dismiss();
  };

  const handleGenerateCribSheet = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Generating crib sheet...', {
      position: 'bottom-center',
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedCribSheet = await generateCribSheet(file.url, file.name);
      if (generatedCribSheet) {
        await saveGeneratedContent('cribsheet', generatedCribSheet);
      }
    }
    toast.dismiss();
  };

  const handleFlashcardClick = async () => {
    setFlashcardsClicked(flashcardsClicked + 1);

    // Persist to Supabase
    await supabase
      .from('user_statistics')
      .upsert({ user_id: classId, flashcards_clicked: flashcardsClicked + 1, cumulative_score: cumulativeScore });
  };

  const handleTestCompletion = async (score: number) => {
    const newCumulativeScore = cumulativeScore + score;
    setCumulativeScore(newCumulativeScore);

    // Persist to Supabase
    await supabase
      .from('user_statistics')
      .upsert({ user_id: classId, flashcards_clicked: flashcardsClicked, cumulative_score: newCumulativeScore });
  };

  useEffect(() => {
    if (generatedFlashCards.length > 0) {
      const allFlashcards: Flashcard[] = [];

      generatedFlashCards.forEach((file) => {
        const content = file.content;

        // Split the content by '---' to get individual flashcards
        const entries = content.split('---');

        entries.forEach((entry) => {
          const trimmedEntry = entry.trim();
          if (trimmedEntry) {
            // Extract question and answer using regular expressions
            const questionMatch = trimmedEntry.match(/Q:\s*(.+)/);
            const answerMatch = trimmedEntry.match(/A:\s*(.+)/);

            if (questionMatch && answerMatch) {
              const question = questionMatch[1].trim();
              const answer = answerMatch[1].trim();

              allFlashcards.push({ question, answer });
            }
          }
        });
      });

      setParsedFlashcards(allFlashcards);
    } else {
      setParsedFlashcards([]);
    }
  }, [generatedFlashCards]);

  useEffect(() => {
    if (generatedTests.length > 0) {
      setParsedTests(generatedTests);
    } else {
      setParsedTests([]);
    }
  }, [generatedTests]);

  return (
    <div className="flex flex-col">
      {/* Display statistics */}
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white">
        <h3 className="text-2xl font-semibold mb-2">Statistics:</h3>
        <p className="text-gray-700 text-lg font-bold mb-1">
          Flashcards Mastered: <span className="text-green-500">{flashcardsClicked}</span>
        </p>
        <p className="text-gray-700 text-lg font-bold">
          Correct Practice Quiz Answers: <span className="text-green-500">{cumulativeScore}</span>
        </p>
      </div>
      <div className="flex gap-4">
        {/* Left Side: File Upload and List */}
        <div className="w-1/2 flex flex-col gap-4 border p-4 rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Files</h2>
          </div>

          {/* Upload area */}
          <FileUploadArea classId={classId} fetchFiles={fetchFiles} />

          {/* File list */}
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <FileListItem
                key={file.name}
                file={file}
                classId={classId}
                onFileClick={handleFileClick}
                fetchFiles={fetchFiles}
                onGenerateTest={handleGenerateTest}
                onGenerateFlashCards={handleGenerateFlashCards}
                onGenerateCribSheet={handleGenerateCribSheet}
              />
            ))}
            {files.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No files uploaded yet
              </p>
            )}
          </div>

          {/* File Preview Modal */}
          {selectedFile && selectedFile.url && (
            <FilePreviewModal
              file={{ ...selectedFile, url: selectedFile.url }}
              classId={classId}
              onClose={() => setSelectedFile(null)}
              onDelete={() => {
                fetchFiles();
                setSelectedFile(null);
              }}
            />
          )}
        </div>

        {/* Gap between file upload and generated content */}
        <div className="w-1/12"></div>

        {/* Right Side: Generated Content */}
        <div className="w-2/3 flex flex-col gap-4 border p-4 rounded-lg shadow-md bg-white">
          {/* Generated Tests */}
          <GeneratedContent
            title="Generated Tests"
            items={generatedTests}
            selectedIndex={selectedTestIndex}
            onItemSelect={setSelectedTestIndex}
            colorClass="text-blue-500"
            renderExtraButtons={(item, index) => (
              <button
                className="text-red-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id) {
                    handleDeleteGeneratedContent('test', item.id);
                  }
                  console.log(index);
                }}
              >
                <FaTrash size={14} />
              </button>
            )}
          />

          {/* Generated Flash Cards */}
          <GeneratedContent
            title="Generated Flash Cards"
            items={generatedFlashCards}
            selectedIndex={selectedFlashCardIndex}
            onItemSelect={setSelectedFlashCardIndex}
            colorClass="text-green-500"
            renderExtraButtons={(item, index) => (
              <button
                className="text-red-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id) {
                    handleDeleteGeneratedContent('flashcard', item.id);
                    console.log(index);
                  }
                }}
              >
                <FaTrash size={14} />
              </button>
            )}
          />

          {/* Generated Crib Sheets */}
          <GeneratedContent
            title="Generated Crib Sheets"
            items={generatedCribSheets}
            selectedIndex={selectedCribSheetIndex}
            onItemSelect={setSelectedCribSheetIndex}
            colorClass="text-purple-500"
            renderExtraButtons={(item, index) => (
              <button
                className="text-red-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.id) {
                    handleDeleteGeneratedContent('cribsheet', item.id);
                    console.log(index);
                  }
                }}
              >
                <FaTrash size={14} />
              </button>
            )}
          />
        </div>
      </div>

      {/* Interactive Flashcards */}
      <div className="flashcard-app mt-8 border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-bold mb-4">Interactive Flashcards</h2>
        <FlashcardApp flashcards={parsedFlashcards} onFlashcardClick={handleFlashcardClick} />
      </div>

      {/* Interactive Practice Quiz */}
      <div className="test-app mt-8 border p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-bold mb-4">Interactive Practice Quiz</h2>
        <TestApp tests={parsedTests} onTestCompletion={handleTestCompletion} />
      </div>
    </div>
  );
}