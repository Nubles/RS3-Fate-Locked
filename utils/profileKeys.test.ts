import { describe, expect, it } from 'vitest';
import { findSharedRs3Profiles, PROFILE_PREFIX, PROFILES_KEY, SHARED_PROFILE_PREFIX, SHARED_PROFILES_KEY } from './profileKeys';

const storageOf = (entries: Record<string, string>) => ({
  getItem: (key: string) => (key in entries ? entries[key] : null),
});

describe('profile keys', () => {
  it('never uses the keys the OSRS tracker owns', () => {
    expect(PROFILES_KEY).not.toBe(SHARED_PROFILES_KEY);
    expect(PROFILE_PREFIX.startsWith(SHARED_PROFILE_PREFIX)).toBe(false);
  });

  it('carries over only the runs this app saved, leaving OSRS runs alone', () => {
    const storage = storageOf({
      [SHARED_PROFILES_KEY]: JSON.stringify({
        version: 2,
        revision: 4,
        deletions: [],
        activeProfileId: 'osrs',
        profiles: [
          { id: 'osrs', name: 'OSRS run', createdAt: 1 },
          { id: 'rs3', name: 'RS3 run', createdAt: 2 },
          { id: 'broken', name: 'Broken', createdAt: 3 },
        ],
      }),
      [`${SHARED_PROFILE_PREFIX}osrs`]: JSON.stringify({ version: 5 }),
      [`${SHARED_PROFILE_PREFIX}rs3`]: JSON.stringify({ version: 2 }),
      [`${SHARED_PROFILE_PREFIX}broken`]: '{',
    });

    expect(findSharedRs3Profiles(storage)).toEqual({
      metadata: {
        profiles: [{ id: 'rs3', name: 'RS3 run', createdAt: 2 }],
        activeProfileId: 'rs3',
      },
      saves: [{ id: 'rs3', data: JSON.stringify({ version: 2 }) }],
    });
  });

  it('starts fresh when no shared run is an RS3 save', () => {
    expect(findSharedRs3Profiles(storageOf({}))).toBeNull();
    expect(findSharedRs3Profiles(storageOf({
      [SHARED_PROFILES_KEY]: JSON.stringify({ profiles: [{ id: 'a', name: 'A', createdAt: 1 }], activeProfileId: 'a' }),
      [`${SHARED_PROFILE_PREFIX}a`]: JSON.stringify({ version: 5 }),
    }))).toBeNull();
  });
});
