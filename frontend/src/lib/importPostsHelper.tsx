import { Brand, Post, ListOfImages, Image } from '@/sharedDataModel';
import { Resolved } from 'jazz-react';
import { createImage } from 'jazz-browser-media-images';

export async function importPostsHelper(
  brand: Resolved<Brand>,
  setImportProgress: (progress: { total: number; done: number }) => void
) {
  const importResult = await fetch(
    `https://graph.facebook.com/v11.0/${brand?.instagramPage?.id}/media?fields=caption,media_type,media_url,children{media_url},permalink,timestamp&access_token=` +
      brand?.instagramAccessToken
  ).then((response) => response.json());

  console.log('importResult', importResult);

  let done = 0;

  for (const post of importResult.data) {
    let imageUrls: string[] = [];
    if (post.media_type === 'IMAGE') {
      imageUrls = [post.media_url];
    } else if (post.media_type === 'CAROUSEL_ALBUM') {
      imageUrls = post.children.data.map(
        (child: { media_url: string }) => child.media_url
      );
    } else {
      console.log('Unknown media type, skipping', post.media_type);
    }

    console.log(imageUrls);

    if (imageUrls.length > 0) {
      const existingPost = brand?.posts?.find(
        (p) =>
          p?.instagram?.state === 'posted' && p?.instagram?.postId === post.id
      );

      console.log('existingPost', post.id, existingPost);

      if (!existingPost) {
        const images = brand.meta.group.createList<ListOfImages>(
          await Promise.all(
            imageUrls.map(
              async (url) =>
                brand.meta.group.createMap<Image>({
                  imageFile: (
                    await createImage(
                      await fetch(url).then((response) => response.blob()),
                      brand.meta.group
                    )
                  ).id,
                }).id
            )
          )
        );

        const succulentPost = brand.meta.group.createMap<Post>({
          content: post.caption,
          images: images.id,
          inBrand: brand.id,
          instagram: {
            state: 'posted',
            postId: post.id,
            postedAt: post.timestamp,
            permalink: post.permalink,
          },
        });

        brand.posts?.append(succulentPost.id);
      }
    }
    done++;

    setImportProgress({
      total: importResult.data.length,
      done,
    });
  }
}
