import { ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { PopoverArrow } from '@radix-ui/react-popover';

export function LargePopoverOrDialog({
  trigger,
  children,
  side,
  alwaysModal,
}: {
  trigger: ReactNode;
  children: (open: boolean) => ReactNode;
  side: 'left' | 'right' | 'top' | 'bottom';
  alwaysModal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!alwaysModal && (
        <Popover onOpenChange={(open) => setOpen(open)}>
          <PopoverTrigger asChild className="hidden lg:block">
            {trigger}
          </PopoverTrigger>
          <PopoverContent
            side={side}
            align="start"
            alignOffset={-50}
            collisionPadding={10}
            className="border-stone-600 h-[calc(min(var(--radix-popover-content-available-height),30rem))] w-[50rem]"
          >
            <PopoverArrow className="fill-stone-300 dark:fill-stone-600 translate-x-2" />
            {children(open)}
          </PopoverContent>
        </Popover>
      )}
      <Dialog onOpenChange={(open) => setOpen(open)}>
        <DialogTrigger asChild className={alwaysModal ? '' : 'lg:hidden'}>
          {trigger}
        </DialogTrigger>
        <DialogContent className="h-[30rem] max-h-[90dvh] max-w-[90dvw] block">
          {children(open)}
        </DialogContent>
      </Dialog>
    </>
  );
}
