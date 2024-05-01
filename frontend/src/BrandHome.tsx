import {
  Link,
  Outlet,
  useLocation,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { Brand, Post } from './sharedDataModel';
import { Button } from './components/ui/button';
import { router } from './router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { ImageTagView } from './components/draftPost/ImageTagView';
import { useAccount, useCoState } from './main';
import { ID } from 'jazz-tools';

type ContextType = {
  activeDraftPost: Post | null;
  setActiveDraftPost: (newPost: Post) => void;
};

export function BrandHome() {
  const { me } = useAccount();
  const brandId = useParams<{ brandId: ID<Brand> }>().brandId;
  const brand = useCoState(Brand, brandId);
  const [currentPage, setCurrentPage] = useState('schedule');
  const navItems = ['schedule', 'insights', 'drafts', 'preferences'];
  const [activeDraftPost, setActiveDraftPost] = useState<Post | null>(null);
  const isMobile = true;
  const location = useLocation();

  const handleClick = (item: string) => {
    setCurrentPage(item);
    router.navigate(`/brand/${brandId}/${item}`);
  };

  const selectBrand = (brand: Brand) => {
    console.log('brand', brand);
  };

  console.log('activeDraftPost', activeDraftPost);

  useEffect(() => {
    const path = location.pathname.split('/');
    setCurrentPage(path[path.length - 1]);
  }, []);

  return (
    <div className="flex flex-col-reverse lg:flex-col max-h-[100dvh] min-h-[100vh]">
      <nav className="flex-none flex gap-6 px-0 py-2 lg:py-3 w-full max-w-[100vw] items-center bg-stone-950 z-10 sm:sticky sm:bottom-0 lg:mt-1">
        <h1 className="text-stone-300 pl-6 flex flex-shrink-0">
          <Link to="/" className="tracking-wider flex align-middle">
            🪴
          </Link>{' '}
          /
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">{brand?.name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem key={`mobile-${brand}`}>
                <Link to="/">+ Add brand</Link>
              </DropdownMenuItem>
              {me.root?.brands?.map((brand) => (
                <DropdownMenuItem
                  key={`mobile-${brand}`}
                  onClick={() => brand && selectBrand(brand)}
                >
                  {brand?.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
      <main className="flex flex-col flex-shrink lg:my-3 overflow-scroll min-h-[93vh] p-2">
        <Outlet
          context={
            { activeDraftPost, setActiveDraftPost } satisfies ContextType
          }
        />
        {activeDraftPost && (
          <ImageTagView
            activeDraftPost={activeDraftPost}
            setActiveDraftPost={setActiveDraftPost}
          />
        )}
      </main>
    </div>
  );
}

export function useActiveDraftPost() {
  return useOutletContext<ContextType>();
}
