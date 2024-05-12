import { useParams } from 'react-router-dom';
import { Brand } from './sharedDataModel';
import { filterDraftAndScheduledPosts } from './lib/filterAndSortPosts';
import { DraftPostList } from './components/feedView/DraftPostList';
import { useDeleteDraft } from './lib/deleteDraft';
import { ID } from 'jazz-tools';
import { useCoState } from './main';
import { LayoutWithNav } from './Nav';

export function Drafts() {
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);
  const posts = filterDraftAndScheduledPosts(brand?.posts);

  return (
    <LayoutWithNav>
      <div className="h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain flex flex-col gap-4">
        <DraftPostList posts={posts} deleteDraft={useDeleteDraft(brand)} />
      </div>
    </LayoutWithNav>
  );
}
