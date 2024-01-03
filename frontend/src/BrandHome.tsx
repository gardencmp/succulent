import { useAutoSub } from 'jazz-react';
import { Outlet, useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Brand } from './sharedDataModel';
import { Button } from './components/ui/button';
import { router } from './router';

export function BrandHome() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);

  return (
    <div className="flex flex-col-reverse lg:flex-col max-h-[100dvh] py-2">
      <nav className="flex-none flex gap-6 px-8 w-full items-center">
        <h1 className="text-stone-300 pl-6 flex flex-shrink-0">
          <div className="tracking-wider">🪴</div> / {brand?.name}
        </h1>
        <Button
          onClick={() => router.navigate('/brand/' + brandId)}
          variant="ghost"
        >
          Home
        </Button>
        <Button
          onClick={() => router.navigate(`/brand/${brandId}/schedule`)}
          variant="ghost"
        >
          Schedule
        </Button>
        <Button
          onClick={() => router.navigate(`/brand/${brandId}/insights`)}
          variant="ghost"
        >
          Insights
        </Button>
      </nav>
      <main className="flex flex-col flex-shrink min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
