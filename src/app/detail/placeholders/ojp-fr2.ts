import * as OJP from 'ojp-sdk';

import { PlaceholderContext } from './placeholder';
import OJP_FR_1_PlaceholderHandle from './ojp-fr1';

export default class OJP_FR_2_PlaceholderHandle extends OJP_FR_1_PlaceholderHandle {
  public override async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const useOJPv1 = true;
    const sdk = this.buildSDK(context, useOJPv1) as OJP.SDK<'1.0'>;

    let fareRequest: OJP.OJPv1_FareRequest | null = null;
    try {
      fareRequest = await this.buildFareRequest(sdk);
    } catch (e) {
      return '<Error>Invalid XML response</Error>';
    }

    const responseXML_Lines = await this.fetchResponse(sdk, fareRequest);
    
    return responseXML_Lines;
  }
}
