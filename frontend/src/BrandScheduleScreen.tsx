import { useAutoSub } from 'jazz-react';
import { CoID } from 'cojson';
import { useParams } from 'react-router-dom';
import { Brand } from './sharedDataModel';
import { CalendarView } from './components/CalendarView';
import { FeedView } from './components/FeedView';
import { useState } from 'react';
import { cn } from './lib/utils';

export function BrandScheduleScreen() {
  type viewTypes = 'feed' | 'calendar';
  const viewTabs = ['feed', 'calendar'];
  const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;
  const brand = useAutoSub(brandId);
  const [activeTab, setActiveTab] = useState<viewTypes>('feed');

  return (
    <div className="flex flex-col gap-6 px-8">
      <h1 className="text-stone-300">{brand?.name} Schedule</h1>
      <ul className="tabs flex mb-3">
        {viewTabs.map((tab) => (
          <li
            key={tab}
            className={cn('cursor-pointer text-stone-400 pr-3', {
              'text-white font-semibold': activeTab === tab,
            })}
            onClick={() => setActiveTab(tab as viewTypes)}
          >
            {tab}
          </li>
        ))}
      </ul>
      {activeTab === 'feed' && <FeedView />}
      {activeTab === 'calendar' && <CalendarView />}
    </div>
  );
}
