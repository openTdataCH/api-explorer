import { AppHelpers } from '../../helpers/app.helpers';
import { PlaceholderContext, PlaceholderHandler } from './placeholder';

export default class IsoTimestampPlaceholderHandler implements PlaceholderHandler {
  public resolve(context: PlaceholderContext): string {
    const nowZuluF = AppHelpers.nowZulu();
    return nowZuluF;
  }
}
