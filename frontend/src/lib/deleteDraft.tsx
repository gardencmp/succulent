import { Brand, Post } from '@/sharedDataModel';
import { useCallback } from 'react';

export const useDeleteDraft = (brand: Brand | undefined | null) =>
  useCallback(
    (post: Post) => {
      if (!brand) return;
      if (!confirm('Are you sure you want to delete this post?')) return;
      post.instagram = {
        state: 'notScheduled',
      };
      const idx = brand.posts?.findIndex((p) => p?.id === post.id);
      typeof idx === 'number' && idx !== -1 && brand.posts?.splice(idx, 1);
    },
    [brand]
  );
