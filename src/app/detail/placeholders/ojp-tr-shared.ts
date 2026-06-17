import * as OJP from 'ojp-sdk';

import { OJP_PlaceholderHandler } from './ojp';

export default abstract class OJP_TR_Shared_PlaceholderHandle extends OJP_PlaceholderHandler {
  protected async fetchTripRequest(sdk: OJP.AnySDK): Promise<OJP.TripRequestResponse | OJP.OJPv1_TripRequestResponse> {
    const fromStopRef = 'ch:1:sloid:7000';
    const toStopRef = 'ch:1:sloid:3000';

    const request = sdk.requests.TripRequest.initWithPlaceRefsOrCoords(fromStopRef, toStopRef);
    
    // set date to 10:00 next day
    const date = new Date();
    date.setHours(10, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    request.setDepartureDatetime(date);

    // TODO: cache requests so we can re-use them
    const response = await request.fetchResponse(sdk);
    
    return response;
  }
}
