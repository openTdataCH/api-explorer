import * as OJP from 'ojp-sdk';
import * as OJP_Types from 'ojp-shared-types';

import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { AppHelpers } from '../../helpers/app.helpers';
import OJP_TR_Shared_PlaceholderHandle from './ojp-tr-shared';

export default class OJP_TRR_1_PlaceholderHandle extends OJP_TR_Shared_PlaceholderHandle implements PlaceholderHandler {
  private async buildRequest(sdk: OJP.SDK<'2.0'>): Promise<OJP.TripRefineRequest> {
    const trResponse = await this.fetchTripRequest(sdk) as OJP.TripRequestResponse;
    
    if (!trResponse.ok) {
      throw new Error('<Error>Invalid TR XML response</Error>');
    }
    
    if (trResponse.value.tripResult.length === 0) {
      throw new Error('<Error>No trips found for TR XML response</Error>');
    }

    const trips = trResponse.value.tripResult.map(el => el.trip);
    const firstTrip = trips[0];

    // HACK - remove expectedDepartureOccupancy nodes due to backend issue
    //      - see https://github.com/openTdataCH/ojp-sdk/issues/387
    firstTrip.leg.forEach(leg => {
      if (leg.timedLeg) {
        const timedLeg = leg.timedLeg as OJP_Types.TimedLegSchema;
        timedLeg.legBoard.expectedDepartureOccupancy = [];
        timedLeg.legAlight.expectedDepartureOccupancy = [];
        timedLeg.legIntermediate.forEach(legIntermediate => {
          legIntermediate.expectedDepartureOccupancy = [];
        })
      }
    });

    const trrRequest = OJP.TripRefineRequest.initWithTrip(firstTrip);

    return trrRequest;
  }

  public async resolve(context: PlaceholderContext): Promise<string | string[]> {
    const sdk = this.buildSDK(context) as OJP.SDK<'2.0'>;

    let trrRequest: OJP.TripRefineRequest | null = null;
    try {
      trrRequest = await this.buildRequest(sdk);
    } catch (e) {
      return '<Error>Invalid XML response</Error>';
    }

    const xmlConfig = OJP.DefaultXML_Config;
    const requestXML = trrRequest.buildRequestXML('de', this.requestorRef, xmlConfig);
    const responseXML_F = AppHelpers.prettyPrintXML(requestXML);
    const responseXML_Lines = responseXML_F.split('\n');
    
    return responseXML_Lines;
  }
}
