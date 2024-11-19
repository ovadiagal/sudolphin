import { createClient } from "@/utils/supabase/server";
import CreateClass from "./create-class";
import { DeleteClassButton } from "./delete-class-button";

export default async function ClassTiles() {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from("Classes")
    .select("*")
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
          className="w-[calc(25%-12px)] h-40 text-white rounded-lg flex items-end p-2 cursor-pointer hover:opacity-95 relative group"
          style={{ backgroundColor: classItem.color }}
        >
          <span className="text-xl">{classItem.name}</span>
          <DeleteClassButton classId={classItem.id} />
        </div>
      ))}
      <CreateClass />
    </div>
  );
}
