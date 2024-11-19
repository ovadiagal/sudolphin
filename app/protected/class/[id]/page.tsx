"use server";

import FileGallery from "@/components/file-gallery";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ClassHeader } from "@/components/class-header";

export default async function ClassPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from("Classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !classData) {
    return notFound();
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <ClassHeader name={classData.name} color={classData.color} />

      <div className="flex gap-6">
        <div className="w-1/2 bg-card rounded-lg p-6">
          <FileGallery classId={id} />
        </div>

        <div className="w-1/2 bg-card rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Right Pane</h2>
          {/* Content for right pane */}
        </div>
      </div>
    </div>
  );
}
