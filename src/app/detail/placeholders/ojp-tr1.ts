import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { OJP_PlaceholderHandler } from './ojp';

export default class OJP_TR_1_PlaceholderHandle extends OJP_PlaceholderHandler implements PlaceholderHandler {
  public async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const sdk = this.buildSDK(context);

    const fromStopRef = 'ch:1:sloid:7000';
    const toStopRef = 'ch:1:sloid:3000';

    const request = sdk.requests.TripRequest.initWithPlaceRefsOrCoords(fromStopRef, toStopRef);
    const responseXML_Lines = await this.fetchResponse(sdk, request);
    
    return responseXML_Lines;
  }
}
