import { useCallback, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
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
import {
  CalendarIcon,
  EyeIcon,
  Grid3X3Icon,
  ListFilterIcon,
  PlusIcon,
} from 'lucide-react';
import { LayoutWithNav } from '@/Nav';
import { FilterBar } from '../FilterBar';
import { CalendarView } from '../CalendarView';

export function ScheduleView() {
  const location = useLocation();
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);

  const [filter, setFilter] = useState<string>();
  const [mobileShowFilterBar, setMobileShowFilterBar] =
    useState<boolean>(false);
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

  if (!brand) return <div>Loading...</div>;

  return (
    <LayoutWithNav>
      <DragToScheduleContext brand={brand}>
        <ResponsiveDrawer
          className="h-full"
          initialDrawerHeightPercent={30}
          minDrawerHeightPercent={10}
        >
          <MainContent className="relative">
            <div
              className={
                'mb-2 flex items-center justify-between gap-2' +
                (mobileShowFilterBar ? ' mb-12' : '')
              }
            >
              <div className="rounded-lg bg-stone-800 border border-stone-700 p-0.5 flex gap-1">
                <NavLink
                  to={`/brand/${brand.id}/schedule/feed`}
                  className="text-sm flex gap-2 py-0.5 px-2 h-auto items-center rounded text-stone-400 hover:text-white [&.active]:bg-stone-950 [&.active]:text-white"
                >
                  <Grid3X3Icon size="1em" /> Feed
                </NavLink>
                <NavLink
                  to={`/brand/${brand.id}/schedule/calendar`}
                  className="text-sm flex gap-2 py-0.5 px-2 h-auto items-center rounded text-stone-400 hover:text-white [&.active]:bg-stone-950 [&.active]:text-white"
                >
                  <CalendarIcon size="1em" /> Calendar
                </NavLink>
              </div>
              <FilterBar
                filter={filter}
                setFilter={setFilter}
                className={
                  mobileShowFilterBar
                    ? 'absolute top-8 left-0 right-0 z-10 '
                    : 'hidden md:block'
                }
                autoFocus={mobileShowFilterBar}
                key={mobileShowFilterBar + ''}
              />
              <div className="flex gap-2">
                <Button
                  variant={mobileShowFilterBar ? 'default' : 'outline'}
                  size="sm"
                  className="md:hidden gap-1 p-2 h-8 overflow-ellipsis text-nowrap "
                  onClick={() => {
                    if (mobileShowFilterBar) {
                      setMobileShowFilterBar(false);
                      setFilter(undefined);
                    } else {
                      setMobileShowFilterBar(true);
                    }
                  }}
                >
                  <ListFilterIcon size={15} /> Filter
                </Button>
                <Button
                  variant={showInsights ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1 p-2 h-8 overflow-ellipsis text-nowrap"
                  onClick={() => setShowInsights(!showInsights)}
                  onDragStart={(e) => {
                    e.preventDefault();
                    alert('woo');
                  }}
                >
                  <EyeIcon size={15} />
                  <span className="hidden md:inline">Compare</span>Insights
                </Button>
              </div>
            </div>

            {location.pathname.endsWith('feed') ? (
              <PostGrid
                posts={filterAndSortScheduledAndPostedPosts(filteredPosts)}
                showInsights={showInsights}
                createDraft={createDraft}
                deleteDraft={deleteDraft}
              />
            ) : (
              <CalendarView />
            )}
          </MainContent>
          <DrawerOrSidebar>
            <div className="uppercase text-xs tracking-wider font-semibold text-stone-500 mb-2 flex items-center justify-between">
              <div onClick={getPostInsights} className="cursor-pointer">
                Drafts
              </div>
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
            <div className="flex flex-col gap-4">
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
    </LayoutWithNav>
  );
}
