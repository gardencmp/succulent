import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Resolved, useAutoSub } from 'jazz-react';
import { Button } from '@/components/ui/button';

import { Brand, ListOfImages, Post } from '@/sharedDataModel';
import {
  filterDraftPosts,
  filterAndSortScheduledAndPostedPosts,
} from '@/lib/filterAndSortPosts';

import {
  DrawerOrSidebar,
  MainContent,
  ResponsiveDrawer,
} from './ResponsiveDrawer';
import { DragToScheduleContext } from './DragToScheduleContext';
import { PostGrid } from './PostGrid';
import { DraftPostList } from './DraftPostList';
import { Toolbar } from './Toolbar';

export function FeedView() {
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);

  const [filter, setFilter] = useState<string>();
  const filteredPosts = brand?.posts?.filter(
    (post) =>
      !filter || post?.content?.toLowerCase().includes(filter.toLowerCase())
  );

  const createDraft = useCallback(() => {
    if (!brand) return;
    const draftPost = brand.meta.group.createMap<Post>({
      instagram: {
        state: 'notScheduled',
      },
      images: brand.meta.group.createList<ListOfImages>().id,
      inBrand: brand.id,
    });
    brand.posts?.append(draftPost.id);
  }, [brand]);

  const deleteDraft = useCallback(
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

  return (
    brand && (
      <DragToScheduleContext brand={brand}>
        <ResponsiveDrawer
          className="h-[calc(100dvh-10rem)]"
          initialDrawerHeightPercent={30}
          minDrawerHeightPercent={10}
        >
          <MainContent className="relative">
            <Toolbar
              brand={brand}
              filter={filter}
              setFilter={setFilter}
              showInsights={showInsights}
              setShowInsights={setShowInsights}
            />

            <PostGrid
              posts={filterAndSortScheduledAndPostedPosts(filteredPosts)}
              showInsights={showInsights}
              createDraft={createDraft}
              deleteDraft={deleteDraft}
            />
          </MainContent>
          <DrawerOrSidebar>
            <Button
              variant="outline"
              className="mb-6 justify-center"
              onClick={createDraft}
            >
              New Draft
            </Button>

            <DraftPostList
              posts={filterDraftPosts(filteredPosts)}
              deleteDraft={deleteDraft}
            />
          </DrawerOrSidebar>
        </ResponsiveDrawer>
      </DragToScheduleContext>
    )
  );
}
