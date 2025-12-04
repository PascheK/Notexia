// apps/web/src/lib/auth/with-auth.tsx
'use client';

import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export function withAuth<P>(Wrapped: ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace('/login');
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center text-slate-200">
          <span>Chargement…</span>
        </div>
      );
    }

    if (!user) {
      // redirection en cours
      return null;
    }

    return <Wrapped {...props} />;
  };

  return ComponentWithAuth;
}