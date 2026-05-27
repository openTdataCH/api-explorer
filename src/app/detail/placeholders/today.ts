import { AppHelpers } from '../../helpers/app.helpers';
import { PlaceholderContext, PlaceholderHandler } from './placeholder';

export default class TodayDatePlaceholderHandler implements PlaceholderHandler {
  public resolve(context: PlaceholderContext): string {
    const todayF = AppHelpers.todayYMD();
    return todayF;
  }
}
