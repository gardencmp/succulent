// "https://graph.facebook.com/{graph-api-version}/{location-id}&access_token={user-access-token}"

import { Location } from "../sharedDataModel";
import { Location as FrontendLocation } from "../../frontend/src/sharedDataModel";

// https://developers.facebook.com/docs/graph-api/reference/location/

// curl -i -X GET \
//   "https://graph.facebook.com/{graph-api-version}/{user-id}?    
//     fields=location{location{city,state,region_id}}&access_token={user-access-token}"

export const handleLocation = ({location}: {
  location: FrontendLocation,
}): FrontendLocation => {
  console.log("location", location);
  
  return {
    name: location.name,
    id: 123456
  }
};
