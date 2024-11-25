"use client";

import { createClient } from "@/utils/supabase/client";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaFile, FaUpload, FaTrash, FaEllipsisV } from "react-icons/fa";
import { toast } from "sonner";
import { FilePreviewModal } from "./file-preview-modal";
import { deleteFile } from "@/app/actions/file";
import { FlashcardApp, Flashcard } from "./interactive-flashcards";
import { TestApp } from "./interactive-tests";

// Import the utility functions
import { generateTest } from "./generate-tests";
import { generateFlashCards } from "./generate-flash-cards";
import { generateCribSheet } from "./generate-crib-sheet";

interface FileObject {
  name: string;
  metadata: {
    size: number;
  };
  url?: string;
}

export default function FileGallery({ classId }: { classId: string }) {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [generatedTests, setGeneratedTests] = useState<
    { fileName: string; content: string }[]
  >([]);
  const [generatedFlashCards, setGeneratedFlashCards] = useState<
    { fileName: string; content: string }[]
  >([]);

  const [generatedCribSheets, setGeneratedCribSheets] = useState<
    { fileName: string; content: string }[]
  >([]);
  const [selectedCribSheetIndex, setSelectedCribSheetIndex] = useState<number | null>(
    null
  );

  const [selectedTestIndex, setSelectedTestIndex] = useState<number | null>(null);
  const [selectedFlashCardIndex, setSelectedFlashCardIndex] = useState<number | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [parsedFlashcards, setParsedFlashcards] = useState<Flashcard[]>([]);
  const [parsedTests, setParsedTests] = useState<{ fileName: string; content: string }[]>([]);

  const supabase = createClient();

  // Fetch files on component mount
  const fetchFiles = async () => {
    const { data, error } = await supabase.storage
      .from("class-files")
      .list(`${classId}/`);

    if (error) {
      toast.error("Error loading files");
      return;
    }

    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("class-files")
          .getPublicUrl(`${classId}/${file.name}`);

        return {
          ...file,
          url: publicUrl,
        };
      })
    );

    // Filter out unnecessary properties and ensure 'metadata' has 'size'
    const filteredFilesWithUrls = filesWithUrls.map((file) => ({
      ...file,
      metadata: { size: file.metadata.size },
    }));

    setFiles(filteredFilesWithUrls);
  };

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, [classId]); // Re-fetch when classId changes

  // Handle file upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      toast.info("Uploading files...");

      for (const file of acceptedFiles) {
        const { error } = await supabase.storage
          .from("class-files")
          .upload(`${classId}/${file.name}`, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }
      }

      toast.success("Upload complete!");
      fetchFiles(); // Refresh file list
      setUploading(false);
    },
    [classId, supabase.storage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  });

  const handleFileClick = (file: FileObject) => {
    if (file.url) {
      setSelectedFile(file);
    }
  };

  const handleDelete = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the preview modal
    try {
      await deleteFile(classId, file.name);
      toast.success("File deleted successfully");
      fetchFiles(); // Refresh the file list
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };

  const handleGenerateClick = async (
    file: FileObject,
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.stopPropagation(); // Prevent file click
    toast.info("Generating study material...", {
      position: "bottom-center",
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedTest = await generateTest(file.url, file.name);
      if (generatedTest) {
        setGeneratedTests((prevTests) => [...prevTests, generatedTest]);
      }
    }
    toast.dismiss();
  };

  const handleGenerateFlashCardsClick = async (
    file: FileObject,
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.stopPropagation(); // Prevent file click
    toast.info("Generating flash cards...", {
      position: "bottom-center",
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedFlashCard = await generateFlashCards(file.url, file.name);
      if (generatedFlashCard) {
        setGeneratedFlashCards((prevFlashCards) => [...prevFlashCards, generatedFlashCard]);
      }
    }
    toast.dismiss();
  };

  const handleGenerateCribSheetClick = async (
    file: FileObject,
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.stopPropagation(); // Prevent file click
    toast.info("Generating crib sheet...", {
      position: "bottom-center",
      duration: Infinity,
      closeButton: false,
    });
    if (file.url) {
      const generatedCribSheet = await generateCribSheet(file.url, file.name);
      if (generatedCribSheet) {
        setGeneratedCribSheets((prevCribSheets) => [...prevCribSheets, generatedCribSheet]);
      }
    }
    toast.dismiss();
  };

  useEffect(() => {
    if (generatedFlashCards && generatedFlashCards.length > 0) {
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
    }
  }, [generatedFlashCards]);

  useEffect(() => {
    if (generatedTests && generatedTests.length > 0) {
      console.log(generatedTests.length);
      setParsedTests(generatedTests);
    }
  }, [generatedTests]);

  return (
    <div className="flex flex-col">
    <div className="flex gap-4">
      {/* Left Side: File Upload and List */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Files</h2>
        </div>

        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary"
                }
                ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <FaUpload className="mx-auto mb-2 text-2xl" />
          <p className="text-sm text-muted-foreground">
            {uploading
              ? "Uploading..."
              : isDragActive
              ? "Drop files here"
              : "Drag and drop files here, or click to select"}
          </p>
        </div>

        {/* File list */}
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer group"
              onClick={() => handleFileClick(file)}
            >
              <FaFile className="text-muted-foreground" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                onClick={(e) => handleDelete(file, e)}
                className="p-2 rounded-full hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete file"
              >
                <FaTrash size={14} />
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === file.name ? null : file.name);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="More options"
                >
                  <FaEllipsisV size={14} />
                </button>
                {dropdownOpen === file.name && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={(e) => handleGenerateClick(file, e)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Generate Practice Tests
                    </button>
                    <button
                      onClick={(e) => handleGenerateFlashCardsClick(file, e)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Generate Flash Cards
                    </button>
                    <button
                      onClick={(e) => handleGenerateCribSheetClick(file, e)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Generate Crib Sheet
                    </button>
                  </div>
                )}
              </div>
            </div>
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

      {/* Right Side: Generated Content */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Generated Tests */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Generated Tests</h3>
        </div>

        {/* Generated Tests List */}
        {generatedTests.length > 0 ? (
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {generatedTests.map((test, index) => (
                <li key={index}>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setSelectedTestIndex(index)}
                  >
                    {test.fileName} - Test {index + 1}
                  </button>
                </li>
              ))}
            </ul>

            {/* Display selected test content */}
            {selectedTestIndex !== null && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-semibold">
                    {generatedTests[selectedTestIndex].fileName} - Test{" "}
                    {selectedTestIndex + 1}
                  </h4>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setSelectedTestIndex(null)}
                  >
                    &times;
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">
                  {generatedTests[selectedTestIndex].content}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">No tests generated yet</p>
        )}

        {/* Generated Flash Cards */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Generated Flash Cards</h3>
        </div>

        {/* Generated Flash Cards List */}
        {generatedFlashCards.length > 0 ? (
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {generatedFlashCards.map((flashCard, index) => (
                <li key={index}>
                  <button
                    className="text-green-500 hover:underline"
                    onClick={() => setSelectedFlashCardIndex(index)}
                  >
                    {flashCard.fileName} - Flash Card {index + 1}
                  </button>
                </li>
              ))}
            </ul>

            {/* Display selected flash card content */}
            {selectedFlashCardIndex !== null && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-semibold">
                    {generatedFlashCards[selectedFlashCardIndex].fileName} - Flash Card{" "}
                    {selectedFlashCardIndex + 1}
                  </h4>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setSelectedFlashCardIndex(null)}
                  >
                    &times;
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">
                  {generatedFlashCards[selectedFlashCardIndex].content}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            No flash cards generated yet
          </p>
        )}

        {/* Generated Crib Sheets */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Generated Crib Sheets</h3>
        </div>

        {/* Generated Crib Sheets List */}
        {generatedCribSheets.length > 0 ? (
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {generatedCribSheets.map((cribSheet, index) => (
                <li key={index}>
                  <button
                    className="text-purple-500 hover:underline"
                    onClick={() => setSelectedCribSheetIndex(index)}
                  >
                    {cribSheet.fileName} - Crib Sheet {index + 1}
                  </button>
                </li>
              ))}
            </ul>

            {/* Display selected crib sheet content */}
            {selectedCribSheetIndex !== null && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-semibold">
                    {generatedCribSheets[selectedCribSheetIndex].fileName} - Crib Sheet{" "}
                    {selectedCribSheetIndex + 1}
                  </h4>
                  <button
                    className="text-gray-600 hover:text-gray-800"
                    onClick={() => setSelectedCribSheetIndex(null)}
                  >
                    &times;
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">
                  {generatedCribSheets[selectedCribSheetIndex].content}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            No crib sheets generated yet
          </p>
        )}
        </div>
      </div>
      <div className="flashcard-app mt-8">
        <h2 className="text-xl font-bold mb-4">Interactive Flashcards</h2>
        <FlashcardApp flashcards={parsedFlashcards}/>
      </div>
      <div className="test-app mt-8">
        <h2 className="text-xl font-bold mb-4">Interactive Practice Quiz</h2>
        <TestApp tests={parsedTests} />
      </div>
    </div>
  );
}
