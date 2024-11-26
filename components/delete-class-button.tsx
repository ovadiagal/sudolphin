'use client';

import { deleteClass } from '@/app/actions/class';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

export function DeleteClassButton({ classId }: { classId: string }) {
  const handleDelete = async () => {
    try {
      await deleteClass(classId);
      toast.success('Class deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete class');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <FaTrash size={10} />
    </button>
  );
}
