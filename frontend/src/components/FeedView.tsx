import {
  Brand,
  InstagramNotScheduled,
  InstagramPosted,
  InstagramScheduleDesired,
  InstagramScheduled,
  ListOfImages,
  Post,
} from '@/sharedDataModel';
import { Resolved, useAutoSub } from 'jazz-react';
import { useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Button } from './ui/button';
import { BrowserImage } from 'jazz-browser-media-images';
import { compareDesc } from 'date-fns';
import { useState } from 'react';
import { PostComponent } from './Post';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DrawerOrSidebar,
  MainContent,
  ResponsiveDrawer,
} from './ResponsiveDrawer';

export function FeedView() {
  const draftStates = ['notScheduled'];
  const scheduledOrPostedStates = ['scheduleDesired', 'scheduled', 'posted'];
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);
  const [activePostID, setActivePostID] = useState<CoID<Post>>();
  const chronologicalScheduledAndPostedPosts = [...(brand?.posts || [])]
    .filter(
      (
        post
      ): post is Resolved<
        Post<InstagramScheduleDesired | InstagramScheduled | InstagramPosted>
      > =>
        !!(
          post &&
          post.instagram &&
          scheduledOrPostedStates.includes(post.instagram.state)
        )
    )
    .sort((a, b) => {
      const dateA = new Date(
        a.instagram.state === 'posted'
          ? a.instagram.postedAt
          : a.instagram.scheduledAt
      );
      const dateB = new Date(
        b.instagram.state === 'posted'
          ? b.instagram.postedAt
          : b.instagram.scheduledAt
      );

      return compareDesc(dateA, dateB);
    });
  const activePost = brand?.posts?.find((post) => post?.id === activePostID);
  const draftPosts = brand?.posts?.filter(
    (post): post is Resolved<Post<InstagramNotScheduled>> =>
      draftStates.includes(post?.instagram.state!)
  );

  return (
    <ResponsiveDrawer
      className="h-[calc(100dvh-10rem)]"
      initialDrawerHeightPercent={30}
      minDrawerHeightPercent={10}
    >
      <MainContent>
        <Dialog>
          <div className="grid grid-cols-3 gap-px">
            <Button
              variant="outline"
              className="aspect-square m-0 p-0 h-auto w-auto col-span-1 rounded-none"
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
            {chronologicalScheduledAndPostedPosts.map(
              (post) =>
                post &&
                post.images?.[0] && (
                  <div className="col-span-1 aspect-square">
                    {post.instagram.state === 'posted' ? (
                      <img
                        key={post?.images[0].id}
                        className="w-full h-full object-cover shrink-0 opacity-50 hover:opacity-100 hover:outline-dotted outline-pink-500"
                        src={
                          post.images[0].imageFile?.as(BrowserImage(500))
                            ?.highestResSrcOrPlaceholder
                        }
                      />
                    ) : (
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex m-0 p-0 h-full w-full hover:outline-dotted outline-pink-500 rounded-none"
                          onClick={() => setActivePostID(post.id)}
                        >
                          <img
                            key={post?.images[0].id}
                            className="block w-full h-full object-cover shrink-0 opacity-50 outline-none hover:opacity-100"
                            src={
                              post.images[0].imageFile?.as(BrowserImage(500))
                                ?.highestResSrcOrPlaceholder
                            }
                          />
                        </Button>
                      </DialogTrigger>
                    )}
                  </div>
                )
            )}
          </div>
          <DialogContent>
            <PostComponent post={activePost!} />
          </DialogContent>
        </Dialog>
      </MainContent>
      <DrawerOrSidebar>
        <Button
          variant="outline"
          className="m-6 justify-center"
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
          New Draft
        </Button>
        {draftPosts?.map((post) => post && <PostComponent post={post} />)}
      </DrawerOrSidebar>
    </ResponsiveDrawer>
  );
}
