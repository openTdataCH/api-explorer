import { API_Config } from "../../config/api-config";

export interface PlaceholderContext {
  apiSpec: any,
  apiConfig: API_Config,
};

export interface PlaceholderHandler {
  resolve(context: PlaceholderContext): string | Promise<string | string[]>;
}
