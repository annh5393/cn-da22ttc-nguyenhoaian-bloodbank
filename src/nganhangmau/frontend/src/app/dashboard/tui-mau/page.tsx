'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TuiMauRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect merged listing to kho-mau page
    router.replace('/dashboard/kho-mau');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
