import { useParams } from 'react-router-dom';
import { useAutoSub } from 'jazz-react';
import { CoID } from 'cojson';
import { Brand } from './sharedDataModel';
import { filterDraftAndScheduledPosts } from './lib/filterAndSortPosts';
import { DraftPostList } from './components/feedView/DraftPostList';
import { useDeleteDraft } from './lib/deleteDraft';

export function Drafts() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);
  const posts = filterDraftAndScheduledPosts(brand?.posts);

  return (
    <>
      <DraftPostList posts={posts} deleteDraft={useDeleteDraft(brand)} />
    </>
  );
}
