import { useCallback, useMemo, useState } from 'react';
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
import { FeedGrid } from './feed/FeedGrid';
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
import { FilterBar } from '../../components/FilterBar';
import { CalendarView } from './calendar/CalendarView';
import { collectHashtagInsights } from '../insights/hashtags/collectHashtagInsights';

let lastInstanceIds: any;

export function PostingPage() {
  const location = useLocation();
  const [showInsights, setShowInsights] = useState<boolean>(false);
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId, {
    posts: [{ images: [], userTags: [] }],
  });

  const [filter, setFilter] = useState<string>();
  const [mobileShowFilterBar, setMobileShowFilterBar] =
    useState<boolean>(false);
  const filteredPosts = useMemo(
    () =>
      brand?.posts?.filter(
        (post): post is NonNullable<typeof post> =>
          !filter ||
          post?.content?.toLowerCase().includes(filter.toLowerCase()) ||
          false
      ),
    [brand?.posts, filter]
  );

  const lastScheduledOrPostDateMs = useMemo(
    () =>
      new Date(
        brand?.posts?.reduce((acc, post) => {
          if (post?.instagram?.state === 'scheduled') {
            return Math.max(
              acc,
              new Date(post.instagram?.scheduledAt).getTime()
            );
          } else if (post?.instagram?.state === 'posted') {
            return Math.max(acc, new Date(post.instagram?.postedAt).getTime());
          }
          return acc;
        }, 0) || new Date(0)
      ).getTime(),
    [brand?.posts]
  );

  const lastScheduledOrPostDate = useMemo(
    () => new Date(lastScheduledOrPostDateMs),
    [lastScheduledOrPostDateMs]
  );

  const allUserTags = useMemo(
    () => [
      ...new Set(
        brand?.posts?.flatMap((post) => Object.keys(post?.userTags || {}))
      ),
    ],
    [brand?.posts]
  );

  const allHashTags = useMemo(
    () =>
      brand
        ? collectHashtagInsights(brand).sort(
            (a, b) => b.relativeReachQuality - a.relativeReachQuality
          )
        : [],
    [brand, brand?.posts]
  );

  const instanceIds = Object.fromEntries(
    brand?.posts?.map((p) => [p?.id, p?._instanceID]) || []
  );
  const diff = lastInstanceIds
    ? Object.keys(instanceIds).filter(
        (id) => lastInstanceIds[id] !== instanceIds[id]
      )
    : [];
  lastInstanceIds = instanceIds;

  console.log(new Date(), diff);

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

  const feedPosts = useMemo(
    () => filterAndSortScheduledAndPostedPosts(filteredPosts),
    [filteredPosts]
  );

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
                  to={`/brand/${brand?.id}/posting/feed`}
                  className="text-sm flex gap-2 py-0.5 px-2 h-auto items-center rounded text-stone-400 hover:text-white [&.active]:bg-stone-950 [&.active]:text-white"
                >
                  <Grid3X3Icon size="1em" /> Feed
                </NavLink>
                <NavLink
                  to={`/brand/${brand?.id}/posting/calendar`}
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
              <FeedGrid
                posts={feedPosts}
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
              <Button
                variant="secondary"
                size="sm"
                className="gap-1 py-0 h-8"
                onClick={createDraft}
              >
                <PlusIcon size={15} /> New Draft
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <DraftPostList
                posts={filterDraftPosts(filteredPosts)}
                deleteDraft={deleteDraft}
                lastScheduledOrPostDate={lastScheduledOrPostDate}
                allHashTags={allHashTags}
                allUserTags={allUserTags}
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
