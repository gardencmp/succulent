import { useAutoSub } from "jazz-react";
import { CoID } from "cojson";
import { useParams } from "react-router-dom";
import { Brand } from "./sharedDataModel";
import { CalendarView } from "./components/CalendarView";
import { FeedView } from "./components/FeedView";

export function BrandScheduleScreen() {
    const brandId = useParams<{ brandId: CoID<Brand> }>().brandId;

    const brand = useAutoSub(brandId);

    return (
        <div className="flex flex-col gap-8 p-8">
            <h1 className="text-3xl ">{brand?.name} Schedule</h1>
            <ul className="tabs flex">
              <li className="selected text-bold">Feed</li>
              <li>Calender</li>
            </ul>
            <FeedView />
            {/* <CalendarView /> */}
        </div>
    );
};
