"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClass(
  formData: FormData
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const className = formData.get("className") as string;
  const color = formData.get("color") as string;

  const { error } = await supabase.from("Classes").insert([
    {
      name: className,
      color: color,
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error("Error inserting class:", error);
    throw error;
  }

  revalidatePath("/protected");
  return { success: true };
}

export async function deleteClass(
  classId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // First, list all files in the class folder
  const { data: files, error: listError } = await supabase.storage
    .from("class-files")
    .list(`${classId}/`);

  if (listError) {
    console.error("Error listing files:", listError);
    throw listError;
  }

  // Delete all files if there are any
  if (files && files.length > 0) {
    const filePaths = files.map((file) => `${classId}/${file.name}`);
    const { error: deleteFilesError } = await supabase.storage
      .from("class-files")
      .remove(filePaths);

    if (deleteFilesError) {
      console.error("Error deleting files:", deleteFilesError);
      throw deleteFilesError;
    }
  }

  // Finally, delete the class itself
  const { error: deleteClassError } = await supabase
    .from("Classes")
    .delete()
    .eq("id", classId);

  if (deleteClassError) {
    console.error("Error deleting class:", deleteClassError.message);
    throw deleteClassError;
  }

  revalidatePath("/protected");
  return { success: true };
}

export async function updateClassColor(
  classId: string,
  newColor: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // Update the color of the class with the specified ID
  const { error } = await supabase
    .from("Classes")
    .update({ color: newColor })
    .eq("id", classId);

  if (error) {
    console.error("Error updating class color:", error.message);
    throw error;
  }

  // Revalidate the path to update UI
  revalidatePath("/protected");

  return { success: true };
}