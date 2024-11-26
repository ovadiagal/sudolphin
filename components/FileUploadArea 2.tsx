import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface FileUploadAreaProps {
  classId: string;
  fetchFiles: () => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ classId, fetchFiles }) => {
  const [uploading, setUploading] = React.useState(false);
  const supabase = createClient();

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      toast.info('Uploading files...');

      for (const file of acceptedFiles) {
        const { error } = await supabase.storage
          .from('class-files')
          .upload(`${classId}/${file.name}`, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }
      }

      toast.success('Upload complete!');
      fetchFiles();
      setUploading(false);
    },
    [classId, supabase.storage, fetchFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 hover:border-primary'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <FaUpload className="mx-auto mb-2 text-2xl" />
      <p className="text-sm text-muted-foreground">
        {uploading
          ? 'Uploading...'
          : isDragActive
          ? 'Drop files here'
          : 'Drag and drop files here, or click to select'}
      </p>
    </div>
  );
};
