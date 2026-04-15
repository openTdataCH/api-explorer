import * as OJP from 'ojp-sdk';

import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { OJP_PlaceholderHandler } from './ojp';

export default class OJP_LIR_1_PlaceholderHandle extends OJP_PlaceholderHandler implements PlaceholderHandler {
  public async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const sdk = this.buildSDK(context);

    const request = sdk.requests.LocationInformationRequest.initWithLocationName('Bern s');
    const responseXML_Lines = await this.fetchResponse(sdk, request);
    
    return responseXML_Lines;
  }
}
