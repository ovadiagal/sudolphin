"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClass(
  formData: FormData,
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
  classId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase.from("Classes").delete().eq("id", classId);

  if (error) {
    console.error("Error deleting class:", error);
    throw error;
  }

  revalidatePath("/protected");
  return { success: true };
}
