import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { OJP_PlaceholderHandler } from './ojp';

export default class OJP_TR_1_PlaceholderHandle extends OJP_PlaceholderHandler implements PlaceholderHandler {
  public async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const sdk = this.buildSDK(context);

    const fromStopRef = '8507000';
    const toStopRef = '8503000';

    const request = sdk.requests.TripRequest.initWithPlaceRefsOrCoords(fromStopRef, toStopRef);
    const responseXML_Lines = await this.fetchResponse(sdk, request);
    
    return responseXML_Lines;
  }
}
