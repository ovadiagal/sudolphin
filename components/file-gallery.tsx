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

interface FileObject {
  name: string;
  metadata: {
    size: number;
  };
  url?: string;
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
  const supabase = createClient();

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

  useEffect(() => {
    fetchFiles();
  }, [classId]);

  const handleFileClick = (file: FileObject) => {
    if (file.url) {
      setSelectedFile(file);
    }
  };

  const handleGenerateTest = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Generating practice test...', {
      position: 'bottom-center',
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

  const handleGenerateFlashCards = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Generating flash cards...', {
      position: 'bottom-center',
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

  const handleGenerateCribSheet = async (file: FileObject, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Generating crib sheet...', {
      position: 'bottom-center',
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

  return (
    <div className="flex gap-4">
      {/* Left Side: File Upload and List */}
      <div className="w-1/2 flex flex-col gap-4">
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

      {/* Right Side: Generated Content */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Generated Tests */}
        <GeneratedContent
          title="Generated Tests"
          items={generatedTests}
          selectedIndex={selectedTestIndex}
          onItemSelect={setSelectedTestIndex}
          colorClass="text-blue-500"
        />

        {/* Generated Flash Cards */}
        <GeneratedContent
          title="Generated Flash Cards"
          items={generatedFlashCards}
          selectedIndex={selectedFlashCardIndex}
          onItemSelect={setSelectedFlashCardIndex}
          colorClass="text-green-500"
        />

        {/* Generated Crib Sheets */}
        <GeneratedContent
          title="Generated Crib Sheets"
          items={generatedCribSheets}
          selectedIndex={selectedCribSheetIndex}
          onItemSelect={setSelectedCribSheetIndex}
          colorClass="text-purple-500"
        />
      </div>
    </div>
  );
}

interface GeneratedItem {
  fileName: string;
  content: string;
}
