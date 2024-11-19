"use client";

import { useState, useTransition } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { SubmitButton } from "./submit-button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { IoCloseSharp } from "react-icons/io5";
import { createClass } from "@/app/actions/class";
import { toast } from "sonner";

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

const CreateClass = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setIsAnimating(true), 0); // Trigger animation
  };

  const handleCloseModal = () => {
    setIsAnimating(false);
    setTimeout(() => setIsModalOpen(false), 200); // Match animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createClass(formData);
        toast.success("Class created successfully!");
        handleCloseModal();
      } catch (error) {
        toast.error("Failed to create class");
        console.error(error);
      }
    });
  };

  return (
    <>
      <div
        onClick={handleOpenModal}
        className="w-[calc(25%-12px)] h-32 bg-zinc-700 text-white rounded-lg flex flex-col gap-2 items-center justify-center p-2 cursor-pointer"
      >
        <FaPlusCircle size={30} />
        <span className="text-l">Add Class</span>
      </div>

      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleBackdropClick}
        >
          <div
            className={`bg-white p-8 rounded-lg w-[25rem] transform transition-transform duration-200 ${
              isAnimating ? "scale-100" : "scale-95"
            }`}
          >
            <form
              className="flex-1 flex flex-col"
              action={handleSubmit}
              autoComplete="off"
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-medium">Create a new class</h1>
                <button type="button" disabled={isPending}>
                  <IoCloseSharp
                    size={32}
                    onClick={handleCloseModal}
                    className="rounded hover:bg-gray-300 p-1"
                  />
                </button>
              </div>
              <div className="flex flex-col gap-2 [&>input]:mb-3">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  name="className"
                  placeholder="CS1301"
                  required
                  autoComplete="off"
                />

                <Label>Color</Label>
                <div className="flex gap-3 flex-wrap justify-center py-2">
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

                <input type="hidden" name="color" value={selectedColor} />

                <SubmitButton
                  className="mt-4"
                  pendingText="Creating..."
                  disabled={isPending}
                >
                  Create Class
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateClass;