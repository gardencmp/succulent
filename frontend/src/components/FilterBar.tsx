import { ListFilterIcon, XIcon } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export function FilterBar({
  filter,
  setFilter,
  className,
  autoFocus,
}: {
  filter: string | undefined;
  setFilter: (filter: string | undefined) => void;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex-1 max-w-xl',
        filter ? ' text-sky-300 [&>input]:border-sky-300' : '',
        className
      )}
    >
      <ListFilterIcon size={15} className="absolute left-2.5 top-[0.5rem]" />
      <Input
        className="w-full h-8 pl-8"
        placeholder="Filter posts..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        autoFocus={autoFocus}
      ></Input>
      {filter && (
        <XIcon
          size={15}
          className="absolute right-2.5 top-[0.5rem] cursor-pointer"
          onClick={() => setFilter('')}
        />
      )}
    </div>
  );
}
