import React, { useState } from 'react';
import { FaFile, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'sonner';
import { deleteFile } from '@/app/actions/file';

interface FileObject {
  name: string;
  metadata: {
    size: number;
  };
  url?: string;
}

interface FileListItemProps {
  file: FileObject;
  classId: string;
  onFileClick: (file: FileObject) => void;
  fetchFiles: () => void;
  onGenerateTest: (file: FileObject, e: React.MouseEvent) => Promise<void>;
  onGenerateFlashCards: (file: FileObject, e: React.MouseEvent) => Promise<void>;
  onGenerateCribSheet: (file: FileObject, e: React.MouseEvent) => Promise<void>;
}

export function FileListItem({
  file,
  classId,
  onFileClick,
  fetchFiles,
  onGenerateTest,
  onGenerateFlashCards,
  onGenerateCribSheet,
}: FileListItemProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteFile(classId, file.name);
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
      console.error(error);
    }
  };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer group"
      onClick={() => onFileClick(file)}
    >
      <FaFile className="text-muted-foreground" />
      <span className="flex-1 truncate">{file.name}</span>
      <span className="text-sm text-muted-foreground">
        {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
      </span>
      <button
        onClick={handleDelete}
        className="p-2 rounded-full hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete file"
      >
        <FaTrash size={14} />
      </button>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="More options"
        >
          <FaEllipsisV size={14} />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={(e) => onGenerateTest(file, e)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Generate Practice Tests
            </button>
            <button
              onClick={(e) => onGenerateFlashCards(file, e)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Generate Flash Cards
            </button>
            <button
              onClick={(e) => onGenerateCribSheet(file, e)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Generate Crib Sheet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
