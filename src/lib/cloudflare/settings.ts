/**
 * Settings module — D1 key/value store for site configuration
 *
 * Replaces any Supabase-based settings with a simple D1 table.
 * Exports: getSetting, setSetting, getSettings, deleteSetting.
 */

import { db } from './d1-client';

// ── Types ─────────────────────────────────────────────────

export interface SiteSetting {
  key: string;
  value: string;
  updatedAt: string;
}

// ── Public API ────────────────────────────────────────────

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await db().first<{ value: string }>(
      `SELECT value FROM site_settings WHERE key = ?`,
      [key]
    );
    return row?.value ?? null;
  } catch (error) {
    console.error('❌ getSetting error:', error);
    return null;
  }
}

/**
 * Get a setting with a typed default
 */
export async function getSettingOr<T extends string>(
  key: string,
  defaultValue: T
): Promise<T> {
  const value = await getSetting(key);
  return (value as T) ?? defaultValue;
}

/**
 * Set a setting (upsert)
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    await db().execute(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, now]
    );
    return true;
  } catch (error) {
    console.error('❌ setSetting error:', error);
    return false;
  }
}

/**
 * Get all settings as a key-value map
 */
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db().all<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings ORDER BY key`
    );
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch (error) {
    console.error('❌ getSettings error:', error);
    return {};
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    await db().execute(`DELETE FROM site_settings WHERE key = ?`, [key]);
    return true;
  } catch (error) {
    console.error('❌ deleteSetting error:', error);
    return false;
  }
}
