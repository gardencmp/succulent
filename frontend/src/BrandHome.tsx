import { useAutoSub } from 'jazz-react';
import { useParams } from 'react-router-dom';
import { CoID } from 'cojson';
import { Brand } from './sharedDataModel';
import { Button } from './components/ui/button';
import { router } from './router';

export function BrandHome() {
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);

  return (
    <>
      <h1 className="text-stone-300 pl-6">{brand?.name}</h1>
      <div className="flex gap-6 px-8 absolute bottom-3 lg:top-10">
        <Button
          onClick={() => router.navigate('/brand/:brandId')}
          variant="ghost"
        >
          Home
        </Button>
        <Button
          onClick={() => router.navigate('/brand/:brandId/schedule')}
          variant="ghost"
        >
          Schedule
        </Button>
        <Button
          onClick={() => router.navigate('/brand/:brandId/insights')}
          variant="ghost"
        >
          Insights
        </Button>
      </div>
    </>
  );
}
