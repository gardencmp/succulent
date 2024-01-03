import { Brand, Post, ListOfImages } from '@/sharedDataModel';
import { useAutoSub } from 'jazz-react';
import { Button } from '../components/ui/button';
import { useParams } from 'react-router-dom';
import { PostComponent } from './Post';
import { CoID } from 'cojson';
import { useCallback, useState } from 'react';

export function CalendarView() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);

  const importPosts = useCallback(async () => {
    const importResult = await fetch(
      `https://graph.facebook.com/v11.0/${brand?.instagramPage?.id}/media?fields=caption,media_type,media_url,children{media_url},permalink,timestamp&access_token=` +
        brand?.instagramAccessToken
    ).then((response) => response.json());

    console.log('importResult', importResult);

    let done = 0;

    for (const post of importResult.data) {
      let imageUrls = [];
      if (post.media_type === 'IMAGE') {
        imageUrls = [post.media_url];
      } else if (post.media_type === 'CAROUSEL_ALBUM') {
        imageUrls = post.children.data.map(
          (child: { media_url: string }) => child.media_url
        );
      } else {
        console.log('Unknown media type, skipping', post.media_type);
      }

      console.log(imageUrls);

      // if (imageUrls.length > 0) {
      //   const post = brand.meta.group.createMap<Post>({
      //     content: post.caption
      // }

      setImportProgress(() => ({
        total: importResult.data.length,
        done,
      }));

      done++;
    }
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
