import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { Brand, ListOfImages, Post } from '@/sharedDataModel';
import {
  filterDraftPosts,
  filterAndSortScheduledAndPostedPosts,
} from '@/lib/filterAndSortPosts';
import { useDeleteDraft } from '@/lib/deleteDraft';

import {
  DrawerOrSidebar,
  MainContent,
  ResponsiveDrawer,
} from './ResponsiveDrawer';
import { DragToScheduleContext } from './DragToScheduleContext';
import { PostGrid } from './PostGrid';
import { DraftPostList } from './DraftPostList';
import { Toolbar } from './Toolbar';
import { ID } from 'jazz-tools';
import { useCoState } from '@/main';

export function FeedView() {
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);

  const [filter, setFilter] = useState<string>();
  const filteredPosts = brand?.posts?.filter(
    (post): post is NonNullable<Post> =>
      !filter ||
      post?.content?.toLowerCase().includes(filter.toLowerCase()) ||
      false
  );

  const createDraft = useCallback(() => {
    if (!brand) return;
    const draftPost = Post.create(
      {
        instagram: {
          state: 'notScheduled',
        },
        images: ListOfImages.create([], { owner: brand._owner }),
        inBrand: brand,
      },
      { owner: brand._owner }
    );
    brand.posts?.push(draftPost);
  }, [brand]);

  const deleteDraft = useDeleteDraft(brand);

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
