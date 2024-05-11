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
import { ID } from 'jazz-tools';
import { useCoState } from '@/main';
import { getPostInsightsHelper } from '@/lib/importPostsHelper';
import { DownloadCloudIcon, EyeIcon, PlusIcon } from 'lucide-react';

export function FeedView() {
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);

  const [filter] = useState<string>();
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

  const getPostInsights = useCallback(async () => {
    if (!brand) return;
    await getPostInsightsHelper(brand);
  }, [brand]);

  return (
    brand && (
      <DragToScheduleContext brand={brand}>
        <ResponsiveDrawer
          className="h-[calc(100dvh-10rem)]"
          initialDrawerHeightPercent={30}
          minDrawerHeightPercent={10}
        >
          <MainContent className="relative">
            <div className="uppercase text-xs tracking-wider font-semibold text-stone-500 mb-2 flex items-center justify-between">
              Feed Preview
              <div className="flex gap-2">
                <Button
                  variant={showInsights ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1 p-2 h-8 overflow-ellipsis text-nowrap"
                  onClick={() => setShowInsights(!showInsights)}
                >
                  <EyeIcon size={15} /> Show{' '}
                  <span className="hidden md:inline">all</span> insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 p-2 h-8 overflow-ellipsis text-nowrap"
                  onClick={getPostInsights}
                >
                  <DownloadCloudIcon size={15} /> Fetch
                </Button>
              </div>
            </div>
            {/* <Toolbar
              brand={brand}
              filter={filter}
              setFilter={setFilter}
              showInsights={showInsights}
              setShowInsights={setShowInsights}
            /> */}

            <PostGrid
              posts={filterAndSortScheduledAndPostedPosts(filteredPosts)}
              showInsights={showInsights}
              createDraft={createDraft}
              deleteDraft={deleteDraft}
            />
          </MainContent>
          <DrawerOrSidebar>
            <div className="uppercase text-xs tracking-wider font-semibold text-stone-500 mb-2 flex items-center justify-between">
              Drafts
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 py-0 h-8"
                  onClick={createDraft}
                >
                  <PlusIcon size={15} /> New Draft
                </Button>
              </div>
            </div>
            <div className="grid xl:grid-cols-2 gap-4">
              <DraftPostList
                posts={filterDraftPosts(filteredPosts)}
                deleteDraft={deleteDraft}
              />
              <Button
                variant="secondary"
                size="sm"
                className="gap-1 h-full min-h-28"
                onClick={createDraft}
              >
                <PlusIcon /> New Draft
              </Button>
            </div>
          </DrawerOrSidebar>
        </ResponsiveDrawer>
      </DragToScheduleContext>
    )
  );
}
