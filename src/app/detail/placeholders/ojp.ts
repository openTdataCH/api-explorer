import * as OJP from 'ojp-sdk';

import { PlaceholderContext, PlaceholderHandler } from './placeholder';
import { API_Tokens } from '../../config/api-tokens';
import { AppHelpers } from '../../helpers/app.helpers';

export abstract class OJP_PlaceholderHandler {
  private buildSDK(context: PlaceholderContext): OJP.SDK<'2.0'> {
    let apiURL: string | null = null;
    try {
      // convention: to build the URL: take first server.url + paths[0] found
      const apiHost = context.apiSpec.servers[0].url as string;
      const apiPath = Object.keys(context.apiSpec.paths)[0] as string;
      apiURL = apiHost + apiPath;
    } catch {
      throw new Error('Cant find apiURL in YAML spec');
    }

    const apiConfig = context.apiConfig;
    const bearerToken = API_Tokens[apiConfig.id] ?? null;

    const stageConfig: OJP.HTTPConfig = {
      url: apiURL,
      authToken: bearerToken,
    };
    const sdk = OJP.SDK.create('odmch-api-explorer', stageConfig, 'de');

    return sdk;
  }

  protected async fetchResponse(context: PlaceholderContext, request: OJP.LocationInformationRequest | OJP.TripRequest) {
    let sdk: OJP.SDK<'2.0'> | null = null;
    try {
      sdk = this.buildSDK(context);
    } catch (e) {
      if (e instanceof Error) {
        return '<Error>' + e.message + '</Error>';
      }

      return '<Error>' + String(e) + '</Error>';
    }

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
