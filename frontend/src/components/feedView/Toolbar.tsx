import { useCallback } from 'react';
import { Resolved } from 'jazz-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brand } from '@/sharedDataModel';
import { getPostInsightsHelper } from '@/lib/importPostsHelper';

export function Toolbar({
  brand,
  filter,
  setFilter,
  showInsights,
  setShowInsights,
}: {
  brand: Resolved<Brand>;
  filter?: string;
  setFilter: (filter: string) => void;
  showInsights: boolean;
  setShowInsights: (showInsights: boolean) => void;
}) {
  const getPostInsights = useCallback(async () => {
    if (!brand) return;
    await getPostInsightsHelper(brand);
  }, [brand]);

  return (
    <div className="flex">
      <Input
        type="text"
        placeholder="filter"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowInsights(!showInsights)}
      >
        show insights
      </Button>
      <Button variant="outline" size="sm" onClick={getPostInsights}>
        fetch insights
      </Button>
    </div>
  );
}
