import { LocalNode, CoID, Media, BinaryStreamInfo } from 'cojson';

export async function loadImageFile(
  node: LocalNode,
  imageFileId: CoID<Media.ImageDefinition>
) {
  const image = await node.load(imageFileId);
  if (image === 'unavailable') {
    console.error(new Date(), 'image unavailable');
    return undefined;
  }
  const originalRes = image.get('originalSize');
  if (!originalRes) {
    console.error(new Date(), 'no originalRes');
    return undefined;
  }
  const resName =
    `${originalRes[0]}x${originalRes[1]}` as `${number}x${number}`;
  const resId = image.get(resName);
  if (!resId) {
    console.error(new Date(), 'no resId');
    return undefined;
  }

  const streamInfo = await new Promise<
    (BinaryStreamInfo & { chunks: Uint8Array[] }) | undefined
  >(async (resolve) => {
    const unsub = node.subscribe(resId, async (res) => {
      if (res === 'unavailable') {
        resolve(undefined);
        return;
      }
      const streamInfo = res.getBinaryChunks();
      if (streamInfo) {
        resolve(streamInfo);
        return;
      }
    });

    setTimeout(() => {
      unsub();
      resolve(undefined);
    }, 10000);
  });

  return streamInfo;
}
