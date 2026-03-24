/**
 * Settings module — re-exports from Cloudflare D1 backend
 */

export {
  getSetting,
  getSettingOr,
  setSetting,
  getSettings,
  deleteSetting,
} from './cloudflare/settings';

export type { SiteSetting } from './cloudflare/settings';
