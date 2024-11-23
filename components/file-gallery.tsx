"use client";

import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaFile, FaUpload, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { FilePreviewModal } from "./file-preview-modal";
import { deleteFile } from "@/app/actions/file";
import axios from "axios";

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
  const [studyMaterial, setStudyMaterial] = useState<string | null>(null);
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
      }),
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
    [classId, supabase.storage],
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

  const handleGenerateStudyMaterial = async (file: FileObject) => {
    if (!file.url) return;

    try {
      const response = await fetch(file.url);
      const fileContent = await response.text();
  
      const res = await axios.post('/api/generate-study-material', { fileContent });
  
      if (res.status === 200) {
        setStudyMaterial(res.data.studyMaterial);
      } else {
        toast.error('Failed to generate study material');
      }
    } catch (error) {
      toast.error('Failed to generate study material');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Files</h2>
      </div>

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}
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
            <button
              onClick={() => handleGenerateStudyMaterial(file)}
              className="p-2 rounded-full hover:bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Generate Study Material"
            >
              Generate
            </button>
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
      {/* Study Material Modal */}
      {studyMaterial && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setStudyMaterial(null)}>
              &times;
            </span>
            <h2>Study Material</h2>
            <p>{studyMaterial}</p>
          </div>
        </div>
      )}
    </div>
  );
}
