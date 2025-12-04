"use client";

import { useEffect, useState } from 'react';
import { withAuth } from '../../../lib/auth/with-auth';
import { getTags } from '../../../lib/api/tags';
import { Tag } from '../../../lib/types/api';

function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    getTags().then(setTags).catch(console.error);
  }, []);

  return (
    <div className="p-4 text-slate-200">
      <h1 className="text-xl font-semibold mb-4">Tags</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t.id} className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-200">
            #{t.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default withAuth(TagsPage);
