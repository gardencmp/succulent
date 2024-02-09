import { Brand, Post } from '@/sharedDataModel';
import { Resolved, ResolvedCoMap } from 'jazz-react';
import { useCallback } from 'react';

export const deleteDraft = (brand: ResolvedCoMap<Brand> | undefined) =>
  useCallback(
    (post: Resolved<Post>) => {
      if (!brand) return;
      if (!confirm('Are you sure you want to delete this post?')) return;
      (post as Resolved<Post>).set('instagram', {
        state: 'notScheduled',
      });
      brand.posts?.delete(brand.posts.findIndex((p) => p?.id === post.id));
    },
    [brand]
  );
