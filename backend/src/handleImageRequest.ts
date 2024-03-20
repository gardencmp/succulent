import { CoID, Media } from 'cojson';

export function handleImageRequest(
  req: Request,
  loadedImages: Map<
    CoID<Media.ImageDefinition>,
    { mimeType?: string; chunks: Uint8Array[] }
  >
) {
  console.log(new Date(), req.url);
  const imageFileId = req.url.split('/image/')[1];
  console.log(new Date(), imageFileId);

  const streamInfo = loadedImages.get(
    imageFileId as CoID<Media.ImageDefinition>
  );

  if (!streamInfo) return new Response('not found', { status: 404 });

  return new Response(new Blob(streamInfo.chunks), {
    headers: {
      'Content-Type': streamInfo.mimeType || 'application/octet-stream',
    },
  });
}
