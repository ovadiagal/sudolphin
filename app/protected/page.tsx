import ClassTiles from '@/components/class-tiles';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <div className="flex-1 self-center w-4/5 flex flex-col mt-16">
      <h3 className="font-bold text-2xl mb-4">Your Classes</h3>
      <div className="flex flex-wrap gap-4">
        <ClassTiles />
      </div>
    </div>
  );
}
