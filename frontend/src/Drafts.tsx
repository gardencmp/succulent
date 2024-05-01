import { useParams } from 'react-router-dom';
import { Brand } from './sharedDataModel';
import { filterDraftAndScheduledPosts } from './lib/filterAndSortPosts';
import { DraftPostList } from './components/feedView/DraftPostList';
import { useDeleteDraft } from './lib/deleteDraft';
import { ID } from 'jazz-tools';
import { useCoState } from './main';

export function Drafts() {
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);
  const posts = filterDraftAndScheduledPosts(brand?.posts);

  return (
    <>
      <DraftPostList posts={posts} deleteDraft={useDeleteDraft(brand)} />
    </>
  );
}
