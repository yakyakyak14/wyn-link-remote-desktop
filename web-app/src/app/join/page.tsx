'use client';

import { Suspense } from 'react';
import { JoinSessionForm } from '@/components/session/JoinSessionForm';

function JoinPageContent() {
  return <JoinSessionForm />;
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}