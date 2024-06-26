import { Account, BinaryCoStream, ID, ImageDefinition } from 'jazz-tools';

export async function loadImageFile(
  imageFileId: ID<ImageDefinition>,
  options: { as: Account }
) {
  const image = await ImageDefinition.load(imageFileId, options.as, {});
  if (!image) {
    console.error(new Date(), 'image unavailable');
    return undefined;
  }
  const originalRes = image.originalSize;
  if (!originalRes) {
    console.error(new Date(), 'no originalRes');
    return undefined;
  }
  const resName =
    `${originalRes[0]}x${originalRes[1]}` as `${number}x${number}`;
  const res = await image._refs[resName].load();
  if (!res) {
    console.error(new Date(), 'no resId');
    return undefined;
  }

  const streamInfo = await new Promise<
    | (ReturnType<(typeof res)['getChunks']> & { chunks: Uint8Array[] })
    | undefined
  >(async (resolve) => {
    const unsub = BinaryCoStream.subscribe(
      res.id,
      options.as,
      [],
      async (res) => {
        const streamInfo = res.getChunks();
        if (streamInfo) {
          resolve(streamInfo);
          return;
        }
      }
    );

    setTimeout(() => {
      unsub();
      resolve(undefined);
    }, 10000);
  });

  return streamInfo;
}
