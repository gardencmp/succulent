import { Post, Image } from '@/sharedDataModel';
import { createImage } from 'jazz-browser-media-images';
import { Input } from '../ui/input';

export function ImageUploader({ post }: { post: Post }) {
  return (
    <Input
      type="file"
      className="w-40 h-40 shrink-0 border relative after:content-['+'] after:absolute after:inset-0 after:bg-white dark:after:bg-black after:cursor-pointer after:z-10 after:text-5xl after:flex after:items-center after:justify-center"
      onChange={(event) => {
        if (!post) return;

        const files = [...(event.target.files || [])];

        Promise.all(
          files.map((file) =>
            createImage(file, { owner: post._owner }).then((image) => {
              post.images?.push(
                Image.create({ imageFile: image }, { owner: post._owner })
              );
            })
          )
        );
      }}
    />
  );
}
