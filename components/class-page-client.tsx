"use client";

import FileGallery from "./file-gallery";
import { ClassHeader } from "./class-header";

interface ClassPageClientProps {
  classData: {
    id: string;
    name: string;
    color: string;
  };
}

export function ClassPageClient({ classData }: ClassPageClientProps) {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <ClassHeader name={classData.name} color={classData.color} />

      <div className="flex gap-6">
        <div className="w-1/2 bg-card rounded-lg p-6">
          <FileGallery classId={classData.id} />
        </div>

        <div className="w-1/2 bg-card rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Right Pane</h2>
          {/* Content for right pane */}
        </div>
      </div>
    </div>
  );
} 