"use client";

import { useParams } from "next/navigation";

interface ClassHeaderProps {
  name: string;
  color: string;
}

export function ClassHeader({ name, color }: ClassHeaderProps) {
  return (
    <div
      className="h-32 w-full rounded-lg flex items-center px-6"
      style={{ backgroundColor: color }}
    >
      <h1 className="text-4xl font-bold text-white">{name}</h1>
    </div>
  );
} 