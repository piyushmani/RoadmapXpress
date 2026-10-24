import { redirect } from 'next/navigation';

export default async function LegacySlugEditorPage() {
  redirect('/roadmap/editor');
}
