"use client";

import { withAuth } from '../../../../lib/auth/with-auth';
import { useAuth } from '../../../../lib/auth/use-auth';

function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-4 text-slate-200">
      <h1 className="text-xl font-semibold mb-3">Profil</h1>
      <div>Email : {user?.email}</div>
      <div>Display name : {user?.displayName ?? '—'}</div>
    </div>
  );
}

export default withAuth(ProfilePage);
