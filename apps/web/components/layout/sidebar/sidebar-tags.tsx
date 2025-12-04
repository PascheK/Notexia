import { useEffect, useState } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { getTags } from '@/lib/api/tags';
import { Tag } from '@/lib/types/api';
import { Badge } from '@/components/ui/badge';

export function SidebarTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTags().then(setTags).catch(console.error);
  }, []);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Tags</span>
        <span className="text-[10px] text-muted-foreground/80">{tags.length}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Badge key={t.id} variant="secondary" className="gap-1 px-2.5 py-1">
            <TagIcon className="h-3 w-3 text-primary/80" aria-hidden />
            {t.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
