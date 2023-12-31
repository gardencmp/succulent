import { Brand, ISODate, ListOfImages, Post } from '@/sharedDataModel';
import { useAutoSub } from 'jazz-react';
import { useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Button } from './ui/button';
import { BrowserImage } from 'jazz-browser-media-images';
import { compareDesc } from 'date-fns';
import { useState } from 'react';
import { PostComponent } from './Post';

export function FeedView() {
  const draftStates = ['scheduleDesired', 'scheduled', 'notScheduled'];
  const scheduledStates = ['scheduleDesired', 'scheduled'];
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);
  const [activePostID, setActivePostID] = useState<CoID<Post>>();
  const chronologicalScheduledPosts = [...(brand?.posts || [])]
    .filter(
      (post) =>
        post && post.instagram && scheduledStates.includes(post.instagram.state)
    )
    .sort((a, b) => {
      console.log('a,b ', a, b);

      return compareDesc(
        new Date((a?.instagram as { scheduledAt: ISODate }).scheduledAt),
        new Date((b?.instagram as { scheduledAt: ISODate }).scheduledAt)
      );
    });
  console.log('post', brand?.posts?.[0]);
  const activePost = brand?.posts?.find((post) => post?.id === activePostID);

  return (
    <div className="container">
      <div className="flex columns-3 w-full">
        <Button
          variant="outline"
          className="h-40 w-40 col-span-1 rounded-none"
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
          +
        </Button>
        {chronologicalScheduledPosts.map(
          (post) =>
            post && (
              <div className="col-span-1">
                {draftStates.includes(post.instagram.state) &&
                  post.images?.[0] && (
                    <Button
                      variant="ghost"
                      className="p-0 h-40 hover:outline-dotted outline-pink-500 rounded-none"
                      onClick={() => setActivePostID(post.id)}
                    >
                      <img
                        key={post?.images[0].id}
                        className="w-40 h-40 object-cover shrink-0 opacity-50 outline-none hover:opacity-100"
                        src={
                          post.images[0].imageFile?.as(BrowserImage)
                            ?.highestResSrcOrPlaceholder
                        }
                      />
                    </Button>
                  )}
                {post.instagram.state === 'posted' && post.images?.[0] && (
                  <img
                    key={post?.images[0].id}
                    className="w-40 h-40 object-cover shrink-0 opacity-50 hover:opacity-100 hover:outline-dotted outline-pink-500"
                    src={
                      post.images[0].imageFile?.as(BrowserImage)
                        ?.highestResSrcOrPlaceholder
                    }
                  />
                )}
              </div>
            )
        )}
      </div>
      {activePost && (
        <div className="modal position-absolute">
          <Button
            variant="ghost"
            className=""
            onClick={() => setActivePostID(undefined)}
          >
            X
          </Button>
          <PostComponent post={activePost} />
        </div>
      )}
    </div>
  );
}
