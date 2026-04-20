import * as OJP from 'ojp-sdk';

import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { API_Tokens } from '../../config/api-tokens';
import { AppHelpers } from '../../helpers/app.helpers';

type OJP_AnyRequest = OJP.LocationInformationRequest | OJP.OJPv1_LocationInformationRequest
      | OJP.TripRequest | OJP.OJPv1_TripRequest;

export abstract class OJP_PlaceholderHandler {
  protected buildSDK(context: PlaceholderContext): OJP.AnySDK {
    let apiURL: string | null = null;
    let ojpVersion: OJP.OJP_VERSION = '2.0';
    try {
      // convention: to build the URL: take first server.url + paths[0] found
      const apiHost = context.apiSpec.servers[0].url as string;
      const apiPath = Object.keys(context.apiSpec.paths)[0] as string;
      apiURL = apiHost + apiPath;

      const requestPathKeys = Object.keys(context.apiSpec.paths);
      const operationId: string = context.apiSpec.paths[requestPathKeys[0]].post.operationId;

      if (operationId.toLowerCase().startsWith('ojp1.0')) {
        ojpVersion = '1.0';
      }
    } catch {
      throw new Error('Cant find apiURL in YAML spec');
    }

    const apiConfig = context.apiConfig;
    const bearerToken = API_Tokens[apiConfig.id] ?? null;

    const stageConfig: OJP.HTTPConfig = {
      url: apiURL,
      authToken: bearerToken,
    };
    const sdk: OJP.AnySDK = (() => {
      if (ojpVersion === '1.0') {
        const legacySDK = OJP.SDK.v1('odmch-api-explorer', stageConfig, 'de');
        return legacySDK;
      }

      const defaultSDK = OJP.SDK.create('odmch-api-explorer', stageConfig, 'de');
      return defaultSDK;
    })();

    return sdk;
  }

  protected async fetchResponse(sdk: OJP.AnySDK, request: OJP_AnyRequest) {
    try {
      await request.fetchResponse(sdk);
    } catch (e) {
      return '<Error>Invalid XML response</Error>';
    }

    const responseXML = request.requestInfo.responseXML ?? '<Error>Inalid response XML</Error>';
    const responseXML_F = AppHelpers.prettyPrintXML(responseXML);

    const responseXML_Lines = responseXML_F.split('\n');

    return responseXML_Lines;
  }
}
