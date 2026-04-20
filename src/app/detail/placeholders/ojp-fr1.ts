import * as OJP from 'ojp-sdk';

import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { AppHelpers } from '../../helpers/app.helpers';
import OJP_TR_Shared_PlaceholderHandle from './ojp-tr-shared';

export default class OJP_FR_1_PlaceholderHandle extends OJP_TR_Shared_PlaceholderHandle implements PlaceholderHandler {
  protected async buildFareRequest(sdk: OJP.SDK<'1.0'>): Promise<OJP.OJPv1_FareRequest> {
    // TODO - the TR rquest will go via OJP Fare API endpoint
    //  -> Shall we hardcode OJP 1.0 URL?
    const response = await this.fetchTripRequest(sdk) as OJP.OJPv1_TripRequestResponse;
    
    if (!response.ok) {
      throw new Error('<Error>Invalid TR XML response</Error>');
    }
    
    if (response.value.tripResult.length === 0) {
      throw new Error('<Error>No trips found for TR XML response</Error>');
    }

    const trips = response.value.tripResult.map(el => el.trip);
    const fareRequest = sdk.requests.FareRequest.initWithOJPv1Trips(trips);

    return fareRequest;
  }

  public async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const useOJPv1 = true;
    const sdk = this.buildSDK(context, useOJPv1) as OJP.SDK<'1.0'>;

    let fareRequest: OJP.OJPv1_FareRequest | null = null;
    try {
      fareRequest = await this.buildFareRequest(sdk);
    } catch (e) {
      return '<Error>Invalid XML response</Error>';
    }

    const xmlConfig = OJP.XML_BuilderConfigOJPv1;
    const requestXML = fareRequest.buildRequestXML('de', this.requestorRef, xmlConfig);
    const responseXML_F = AppHelpers.prettyPrintXML(requestXML);
    const responseXML_Lines = responseXML_F.split('\n');
    
    return responseXML_Lines;
  }
}
