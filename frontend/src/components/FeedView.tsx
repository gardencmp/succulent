import {
  Brand,
  ISODate,
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
import { useCallback, useState } from 'react';
import { DraftPostComponent } from './DraftPost';
import { PostComponent } from './Post';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DrawerOrSidebar,
  MainContent,
  ResponsiveDrawer,
} from './ResponsiveDrawer';
import {
  DndContext,
  useDroppable,
  useDraggable,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { PostInsights } from './PostInsights';
import { smartSchedule } from '@/lib/smartSchedule';
import { getPostInsightsHelper } from '@/lib/importPostsHelper';

export function FeedView() {
  const draftStates = ['notScheduled'];
  const scheduledOrPostedStates = ['scheduleDesired', 'scheduled', 'posted'];
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const [hoveredPost, setHoveredPost] = useState<string | false>(false);
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

  const [draggedPostId, setDraggedPostId] = useState<CoID<Post>>();
  const draggedPost = brand?.posts?.find((post) => post?.id === draggedPostId);

  const firstPostState = chronologicalScheduledAndPostedPosts[0]?.instagram;
  const firstPostDate =
    firstPostState &&
    (firstPostState.state === 'posted'
      ? firstPostState.postedAt
      : firstPostState.scheduledAt);

  const [schedulePreview, setSchedulePreview] = useState<{
    before?: ISODate;
    after?: ISODate;
  }>();

  const getPostInsights = useCallback(async () => {
    if (!brand) return;
    await getPostInsightsHelper(brand);
  }, [brand]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        setDraggedPostId(event.active.id as CoID<Post>);
      }}
      onDragOver={(event) => {
        setSchedulePreview(event.over?.data?.current);
      }}
      onDragEnd={(event) => {
        setDraggedPostId(undefined);
        if (!event.over?.data.current) return;
        console.log(
          'Schedule',
          event.active.id,
          event.over.data.current.before,
          event.over.data.current.after,
          smartSchedule(
            event.over?.data?.current as { before?: ISODate; after?: ISODate }
          )
        );
        const post = brand?.posts?.find((p) => p?.id === event.active.id);
        post?.set('instagram', {
          state: 'scheduleDesired',
          scheduledAt: smartSchedule(
            event.over.data.current as { before?: ISODate; after?: ISODate }
          ),
        });
      }}
      modifiers={[snapCenterToCursor]}
    >
      <ResponsiveDrawer
        className="h-[calc(100dvh-10rem)]"
        initialDrawerHeightPercent={30}
        minDrawerHeightPercent={10}
      >
        <MainContent className="relative">
          <div className="absolute right-0 z-10 text-xs p-1 px-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              show insights
            </Button>
            <Button variant="outline" size="sm" onClick={getPostInsights}>
              fetch insights
            </Button>
          </div>
          <Dialog>
            <div className="grid grid-cols-3">
              <div className="aspect-square m-0 p-1 relative">
                <Button
                  variant="outline"
                  className="aspect-square m-0 p-0 h-full w-full col-span-1 rounded-none"
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
                {draggedPostId && <DropGap after={firstPostDate} />}
              </div>

              {chronologicalScheduledAndPostedPosts.map((post, i) => {
                const olderPost = chronologicalScheduledAndPostedPosts[i + 1];
                const olderPostDate =
                  olderPost &&
                  (olderPost.instagram.state === 'posted'
                    ? olderPost.instagram.postedAt
                    : olderPost.instagram.scheduledAt);
                return (
                  post && (
                    <div className="col-span-1 aspect-square relative p-1">
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex m-0 p-0 h-full w-full rounded-none relative"
                          onClick={() => setActivePostID?.(post.id)}
                          onMouseOver={() => setHoveredPost(post.id)}
                          onMouseLeave={() => setHoveredPost(false)}
                        >
                          {(showInsights || post.id === hoveredPost) && (
                            <>
                              {post.instagram.state === 'posted' ? (
                                <PostInsights post={post} />
                              ) : (
                                <div className="absolute">
                                  scheduled: {post.instagram.scheduledAt}
                                </div>
                              )}
                            </>
                          )}
                          <PostImage post={post} />
                        </Button>
                      </DialogTrigger>
                      {post.instagram.state !== 'posted' && draggedPostId && (
                        <DropGap
                          before={post.instagram.scheduledAt}
                          after={olderPostDate}
                        />
                      )}
                    </div>
                  )
                );
              })}
            </div>
            <DialogContent>
              {activePost?.instagram.state === 'posted' && (
                <PostComponent post={activePost!} border={false} />
              )}
              {activePost?.instagram.state !== 'posted' && (
                <DraftPostComponent
                  post={activePost!}
                  border={false}
                  onDelete={() => {
                    if (!activePost || !brand) return;
                    if (!confirm('Are you sure you want to delete this post?'))
                      return;
                    activePost.set('instagram', {
                      state: 'notScheduled',
                    });
                    brand.posts?.delete(
                      brand.posts.findIndex((p) => p?.id === activePost.id)
                    );
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </MainContent>
        <DrawerOrSidebar>
          <Button
            variant="outline"
            className="mb-6 justify-center"
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
          {draftPosts?.map(
            (post) =>
              post && (
                <Draggable postId={post.id}>
                  <DraftPostComponent
                    post={post}
                    styling="mb-3"
                    onDelete={() => {
                      if (!brand) return;
                      if (
                        !confirm('Are you sure you want to delete this post?')
                      )
                        return;
                      post.set('instagram', {
                        state: 'notScheduled',
                      });
                      brand.posts?.delete(
                        brand.posts.findIndex((p) => p?.id === post.id)
                      );
                    }}
                  />
                </Draggable>
              )
          )}
        </DrawerOrSidebar>
        <DragOverlay>
          {draggedPost && (
            <div
              className={cn('w-32 h-32 transition-transform duration-75', {
                'scale-75': !!schedulePreview,
              })}
            >
              <div className="w-32 h-32 shadow-2xl opacity-70">
                <PostImage post={draggedPost} />
              </div>
              {schedulePreview && (
                <div className="bg-background p-4 rounded mt-2 -mx-24">
                  Schedule:
                  <br />
                  {schedulePreview.before && (
                    <p>
                      Before:{' '}
                      {new Date(schedulePreview.before).toLocaleString()}
                    </p>
                  )}
                  {schedulePreview.after && (
                    <p>
                      After: {new Date(schedulePreview.after).toLocaleString()}
                    </p>
                  )}
                  <p>
                    ✨ Schedule:{' '}
                    {new Date(smartSchedule(schedulePreview)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </ResponsiveDrawer>
    </DndContext>
  );
}

function PostImage({ post }: { post: Resolved<Post> }) {
  return (
    post.images?.[0] && (
      <img
        key={post.images[0].id}
        className={cn(
          'block w-full h-full object-cover shrink-0 outline-none hover:opacity-100',
          {
            'opacity-50': post.instagram.state !== 'posted',
          }
        )}
        src={
          post.images[0].imageFile?.as(BrowserImage(500))
            ?.highestResSrcOrPlaceholder
        }
      />
    )
  );
}

function DropGap({ before, after }: { before?: ISODate; after?: ISODate }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'dropGap-' + after + '-' + before,
    data: { after, before },
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute top-0 bottom-0 w-20 -right-10 z-10 flex justify-center items-center"
    >
      <div
        className={cn('h-[80%] rounded', {
          'w-1': isOver,
          'w-px': !isOver,
          'bg-neutral-500': !isOver,
          'bg-pink-500': isOver,
        })}
      />
    </div>
  );
}

function Draggable({
  children,
  postId,
}: {
  children: React.ReactNode;
  postId: CoID<Post>;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: postId,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-30' : ''}
    >
      {children}
    </div>
  );
}
