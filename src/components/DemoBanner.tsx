import { Eye } from 'lucide-react';
import { isDemoMode } from '@/lib/demoMode';

export default function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950">
      <Eye className="h-4 w-4" />
      Demo-Modus – Nur Ansicht, keine Änderungen möglich
    </div>
  );
}
