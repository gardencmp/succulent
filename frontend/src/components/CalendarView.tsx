import { Brand, Post, ListOfImages } from '@/sharedDataModel';
import { useAutoSub } from 'jazz-react';
import { Button } from '../components/ui/button';
import { useParams } from 'react-router-dom';
import { PostComponent } from './Post';
import { CoID } from 'cojson';
import { useCallback, useState } from 'react';
import { importPostsHelper } from '../lib/importPostsHelper';

export function CalendarView() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);

  const importPosts = useCallback(async () => {
    if (!brand) return;
    await importPostsHelper(brand, setImportProgress);
  }, [brand]);

  const [importProgress, setImportProgress] = useState<{
    total: number;
    done: number;
  }>();

  return (
    <div className="flex flex-col gap-8 p-8">
      <Button onClick={importPosts}>
        Import posts{' '}
        {importProgress && importProgress.done + '/' + importProgress.total}
      </Button>
      <Button
        variant="outline"
        className="h-20"
        onClick={() => {
          if (!brand) return;
          const draftPost = brand.meta.group.createMap<Post>({
            instagram: {
              state: 'notScheduled',
            },
            images: brand.meta.group.createList<ListOfImages>().id,
            inBrand: brand.id,
          });
          brand.posts?.append(draftPost.id);
        }}
      >
        + Add draft post
      </Button>
      {brand?.posts?.map(
        (post) =>
          post && (
            <PostComponent
              key={post.id}
              post={post}
              onDelete={() => {
                post.set('instagram', {
                  state: 'notScheduled',
                });
                brand.posts?.delete(
                  brand.posts.findIndex((p) => p?.id === post.id)
                );
              }}
            />
          )
      )}
    </div>
  );
}
