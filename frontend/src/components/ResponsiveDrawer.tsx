import { useBreakpoint } from '@/lib/useBreakpoint';
import { cn } from '@/lib/utils';
import { ReactNode, createContext, useContext, useRef, useState } from 'react';

const ResponsiveDrawerContext = createContext<{
  drawerHeight: number;
  setDragStart: (h: DragStart | undefined) => void;
} | null>(null);

type DragStart = { initialDrawerHeight: number; dragStartScreenY: number };

export function ResponsiveDrawer(props: {
  className: string;
  children: ReactNode;
  initialDrawerHeightPercent: number;
  minDrawerHeightPercent: number;
}) {
  const [drawerHeight, setDrawerHeight] = useState(
    props.initialDrawerHeightPercent
  );
  const container = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<DragStart | undefined>();

  return (
    <div
      ref={container}
      className={cn(props.className, 'md:grid grid-cols-12')}
      onPointerMove={(e) => {
        if (dragStart && container.current) {
          const dy = e.screenY - dragStart.dragStartScreenY;
          const dyRelative = dy / container.current.clientHeight;
          const newDrawerHeight =
            dragStart.initialDrawerHeight - dyRelative * 100;
          setDrawerHeight(
            Math.max(props.minDrawerHeightPercent, newDrawerHeight)
          );
        }
      }}
      onPointerUp={() => {
        setDragStart(undefined);
      }}
    >
      <ResponsiveDrawerContext.Provider
        value={{
          drawerHeight,
          setDragStart,
        }}
      >
        {props.children}
      </ResponsiveDrawerContext.Provider>
    </div>
  );
}

export function MainContent(props: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(ResponsiveDrawerContext);
  if (!ctx)
    throw new Error('MainContent must be used within ResponsiveDrawerScreen');

  const { isMd } = useBreakpoint('md');

  return (
    <div
      className={cn(
        'md:col-span-8 xl:col-span-6 overflow-y-auto',
        props.className
      )}
      style={{
        height: isMd ? undefined : 100 - ctx.drawerHeight + '%',
      }}
    >
      {props.children}
    </div>
  );
}

export function DrawerOrSidebar(props: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(ResponsiveDrawerContext);
  if (!ctx)
    throw new Error('MainContent must be used within ResponsiveDrawerScreen');

  const { isMd } = useBreakpoint('md');

  return (
    <>
      {isMd ? (
        <div
          className={cn(
            'flex md:col-span-4 xl:col-span-6 flex-col overflow-auto',
            props.className
          )}
        >
          {props.children}
        </div>
      ) : (
        <div
          className={cn('flex flex-col overflow-auto', props.className)}
          style={{
            height: ctx.drawerHeight + '%',
          }}
        >
          <DrawerHandle />
          {props.children}
        </div>
      )}
    </>
  );
}

export function DrawerHandle() {
  const ctx = useContext(ResponsiveDrawerContext);
  if (!ctx)
    throw new Error('MainContent must be used within ResponsiveDrawerScreen');

  return (
    <div
      className="group sticky top-0 bg-background z-20 flex items-center justify-center min-h-10 cursor-move border-t rounded-t-xl"
      onPointerDown={(e) => {
        ctx.setDragStart({
          initialDrawerHeight: ctx.drawerHeight,
          dragStartScreenY: e.screenY,
        });
        e.preventDefault();
      }}
    >
      <div className="bg-neutral-600 group-hover:bg-neutral-200 w-20 h-1 " />
    </div>
  );
}
