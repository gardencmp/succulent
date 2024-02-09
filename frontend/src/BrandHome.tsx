import { useAutoSub } from 'jazz-react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Brand } from './sharedDataModel';
import { Button } from './components/ui/button';
import { router } from './router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export function BrandHome() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);
  const [currentPage, setCurrentPage] = useState('schedule');
  const navItems = ['schedule', 'insights', 'drafts', 'preferences'];
  const isMobile = true;
  let location = useLocation();

  const handleClick = (item: string) => {
    setCurrentPage(item);
    router.navigate(`/brand/${brandId}/${item}`);
  };

  useEffect(() => {
    const path = location.pathname.split('/');
    setCurrentPage(path[path.length - 1]);
  }, []);

  return (
    <div className="flex flex-col-reverse lg:flex-col max-h-[100dvh]">
      <nav className="flex-none flex gap-6 px-8 w-full max-w-[100vw] items-center bg-stone-950 z-10">
        <h1 className="text-stone-300 pl-6 flex flex-shrink-0">
          <div className="tracking-wider">🪴</div> / {brand?.name}
        </h1>
        {!isMobile &&
          navItems.map((item) => (
            <Button
              onClick={() => handleClick(item)}
              variant="ghost"
              key={`desktop-${item}`}
              size="sm"
            >
              {item}
            </Button>
          ))}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">{currentPage}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {navItems?.map((item) => (
                <DropdownMenuItem
                  key={`mobile-${item}`}
                  onClick={() => handleClick(item)}
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
      <main className="flex flex-col flex-shrink min-h-0 my-3">
        <Outlet />
      </main>
    </div>
  );
}
