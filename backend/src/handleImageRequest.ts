import { ID, ImageDefinition } from 'jazz-tools';

export function handleImageRequest(
  req: Request,
  loadedImages: Map<
    ID<ImageDefinition>,
    { mimeType?: string; chunks: Uint8Array[] }
  >
) {
  console.log(new Date(), req.url);
  const imageFileId = req.url.split('/image/')[1];
  console.log(new Date(), imageFileId);

  const streamInfo = loadedImages.get(imageFileId as ID<ImageDefinition>);

  if (!streamInfo) return new Response('not found', { status: 404 });

  return new Response(new Blob(streamInfo.chunks), {
    headers: {
      'Content-Type': streamInfo.mimeType || 'application/octet-stream',
    },
  });
}
