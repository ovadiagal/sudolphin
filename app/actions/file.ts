"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteFile(classId: string, fileName: string): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("class-files")
    .remove([`${classId}/${fileName}`]);

  if (error) {
    console.error("Error deleting file:", error);
    throw error;
  }

  revalidatePath(`/protected/class/${classId}`);
  return { success: true };
} 