/**
 * Storage keys for RS3 profiles.
 *
 * The OSRS tracker is served from the same GitHub Pages site, so both apps
 * share one localStorage. They used to share the same keys too: opening this
 * app converted the active OSRS save to RS3 and wrote it back, and deleting a
 * profile here deleted the OSRS run with the same id. Every key this app
 * writes for profiles and saves now starts with RS3_, and it never writes the
 * shared FATE_* keys.
 */

import type { Profile, ProfileMetadata } from '../types';

export const PROFILES_KEY = 'RS3_FATE_PROFILES';
export const PROFILE_PREFIX = 'RS3_FATE_PROFILE_';

/** The keys both apps used before they were split. Read once, never written. */
export const SHARED_PROFILES_KEY = 'FATE_PROFILES';
export const SHARED_PROFILE_PREFIX = 'FATE_PROFILE_';

/** This app stamps saves with version 2; the OSRS tracker's are version 3 and up. */
const RS3_SAVE_VERSION = 2;

type ReadOnlyStorage = Pick<Storage, 'getItem'>;

const isRs3Save = (raw: string | null): raw is string => {
  if (raw === null) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return false;
    const version = (parsed as { version?: unknown }).version;
    return version === RS3_SAVE_VERSION;
  } catch {
    return false;
  }
};

/**
 * The RS3 runs saved under the shared keys before the split, so they carry
 * over. Only saves this app stamped (version 2) are taken; the OSRS tracker's
 * own runs are left alone. Returns the profiles and their save data to copy,
 * or null when there are none.
 */
export const findSharedRs3Profiles = (
  storage: ReadOnlyStorage,
): { metadata: ProfileMetadata; saves: Array<{ id: string; data: string }> } | null => {
  let shared: unknown;
  try {
    shared = JSON.parse(storage.getItem(SHARED_PROFILES_KEY) ?? 'null');
  } catch {
    return null;
  }
  if (typeof shared !== 'object' || shared === null) return null;
  const list = (shared as { profiles?: unknown }).profiles;
  if (!Array.isArray(list)) return null;

  const profiles: Profile[] = [];
  const saves: Array<{ id: string; data: string }> = [];
  for (const candidate of list) {
    if (typeof candidate !== 'object' || candidate === null) continue;
    const { id, name, createdAt } = candidate as Partial<Profile>;
    if (typeof id !== 'string' || typeof name !== 'string') continue;
    const data = storage.getItem(`${SHARED_PROFILE_PREFIX}${id}`);
    if (!isRs3Save(data)) continue;
    profiles.push({ id, name, createdAt: typeof createdAt === 'number' ? createdAt : Date.now() });
    saves.push({ id, data });
  }
  if (profiles.length === 0) return null;

  const sharedActive = (shared as { activeProfileId?: unknown }).activeProfileId;
  const activeProfileId = profiles.some(profile => profile.id === sharedActive)
    ? sharedActive as string
    : profiles[0].id;
  return { metadata: { profiles, activeProfileId }, saves };
};
