"use client";

import { useState, useTransition } from "react";
import { updateClassColor } from "@/app/actions/class";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#84cc16", // lime
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
];

const ColorClassButton = ({
  classId,
  initialColor,
}: {
  classId: string;
  initialColor: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [isPending, startTransition] = useTransition();

  const togglePanel = () => setIsOpen(!isOpen);

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await updateClassColor(classId, selectedColor);
        toast.success("Class color updated successfully!");
        setIsOpen(false); // Close the panel after success
      } catch (error) {
        toast.error("Failed to update class color");
        console.error(error);
      }
    });
  };

  const handleClosePanel = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Edit button */}
      <button
        onClick={togglePanel}
        className="absolute top-2 left-2 p-2 rounded-full bg-black/20 hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FaEdit size={10} />
      </button>

      {/* Color selection panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[200px] p-4 bg-zinc-200 border rounded shadow-lg z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-zinc-500">Select a New Color</h3>
            <button
              type="button"
              onClick={handleClosePanel}
              className="p-1 rounded hover:bg-gray-300"
            >
              <IoCloseSharp size={18} className="text-zinc-500"/>
            </button>
          </div>

          <div className="flex gap-3 flex-wrap mb-4">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                disabled={isPending}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color
                    ? "scale-110 ring-2 ring-offset-2 ring-black"
                    : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-blue-300"
          >
            {isPending ? "Updating..." : "Update Color"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorClassButton;
