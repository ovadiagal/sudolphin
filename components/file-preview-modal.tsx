"use client";

import { IoCloseSharp } from "react-icons/io5";

interface FilePreviewModalProps {
  file: {
    name: string;
    url: string;
  };
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold truncate">{file.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 p-1"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          {file.name.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={file.url}
              className="w-full h-full"
              title={file.name}
            />
          ) : file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain mx-auto"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <a
                href={file.url}
                download
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 