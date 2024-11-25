import { createClient } from "@/utils/supabase/server";
import CreateClass from "./create-class";
import { DeleteClassButton } from "./delete-class-button";
import Link from "next/link";
import ColorClassButton from "./color-class-button";

export default async function ClassTiles() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: classes, error } = await supabase
    .from("Classes")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return <div>Error loading classes</div>;
  }

  return (
    <div className="w-full flex flex-wrap gap-4">
      {classes?.map((classItem) => (
        <div
          key={classItem.id}
          className="w-[calc(25%-12px)] h-32 text-white rounded-lg relative group"
          style={{ backgroundColor: classItem.color }}
        >
          <Link
            href={`/protected/class/${classItem.id}`}
            className="absolute inset-0 p-2 flex items-end hover:opacity-95"
          >
            <span className="text-xl">{classItem.name}</span>
          </Link>
          <DeleteClassButton classId={classItem.id} />
          <ColorClassButton classId={classItem.id} initialColor={classItem.color}/>
        </div>
      ))}
      <CreateClass />
    </div>
  );
}
