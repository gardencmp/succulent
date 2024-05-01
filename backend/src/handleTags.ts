// https://developers.facebook.com/docs/instagram-api/guides/content-publishing/

import { Tag } from "../sharedDataModel";
import { Tag as FrontendTag } from "../../frontend/src/sharedDataModel";

export const handleTags = ({tags}: {tags: FrontendTag[]}): Tag[] => {
  return tags.map((tag): Tag => {
    return {
      username: tag.username,
      x: (!!tag.x ? tag.x : +Math.random().toFixed(1)),
      y: (tag.y || +Math.random().toFixed(1)),
    }
  });  
};
