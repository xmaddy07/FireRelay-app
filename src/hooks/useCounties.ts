import {useCallback, useEffect, useRef, useState} from 'react';
import {buildCountyListItem} from '../api/mappers/countyMapper';
import {
  getCountyConnectedUsers,
  getCountyDetail,
  listCountiesWithConnections,
  refreshCountyListItem,
} from '../api/services/countyService';
import type {CountyListItem} from '../api/types/county';
import {pickLatestTimestamp} from '../utils/countyActivity';
import type {FeedItem} from '../screens/main/feeds/feedTypes';
import {useAuth} from './useAuth';

type UseCountiesOptions = {
  enabled?: boolean;
  feedItems?: FeedItem[];
};

const mergeFeedLastActive = (
  counties: CountyListItem[],
  feedItems: FeedItem[],
  nowMs: number,
): CountyListItem[] => {
  if (feedItems.length === 0) {
    return counties;
  }

  const lastActiveByKey = new Map<string, string>();
  feedItems.forEach(item => {
    const keys = [item.countyId, item.county].filter(Boolean) as string[];
    keys.forEach(key => {
      if (!item.timestamp) {
        return;
      }
      const prev = lastActiveByKey.get(key);
      lastActiveByKey.set(
        key,
        pickLatestTimestamp(prev, item.timestamp) ?? item.timestamp,
      );
    });
  });

  return counties.map(county => {
    const keys = [county.id, county.name].filter(Boolean) as string[];
    let feedLastActive: string | null = null;
    keys.forEach(key => {
      feedLastActive = pickLatestTimestamp(
        feedLastActive,
        lastActiveByKey.get(key),
      );
    });

    const mergedLastActive = pickLatestTimestamp(county.lastActiveAt, feedLastActive);
    if (mergedLastActive === county.lastActiveAt) {
      return county;
    }

    return buildCountyListItem(
      county,
      county.userCount,
      mergedLastActive,
      nowMs,
    );
  });
};

export const useCounties = ({
  enabled = true,
  feedItems = [],
}: UseCountiesOptions = {}) => {
  const {token} = useAuth();
  const [counties, setCounties] = useState<CountyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const feedItemsRef = useRef(feedItems);
  const loadGenerationRef = useRef(0);

  useEffect(() => {
    feedItemsRef.current = feedItems;
  }, [feedItems]);

  const loadCounties = useCallback(async () => {
    if (!token || !enabled) {
      loadGenerationRef.current += 1;
      setCounties([]);
      setError(null);
      setLoading(false);
      return;
    }

    const generation = ++loadGenerationRef.current;
    setLoading(true);
    setError(null);
    try {
      const loaded = await listCountiesWithConnections(token);
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setCounties(
        mergeFeedLastActive(loaded, feedItemsRef.current, Date.now()),
      );
    } catch (loadError) {
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load counties.',
      );
    } finally {
      if (generation === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, token]);

  useEffect(() => {
    void loadCounties();
  }, [loadCounties]);

  useEffect(() => {
    if (!token) {
      return;
    }
    setCounties(prev => {
      if (prev.length === 0) {
        return prev;
      }
      const merged = mergeFeedLastActive(prev, feedItems, Date.now());
      const unchanged = merged.every(
        (county, index) => county === prev[index],
      );
      return unchanged ? prev : merged;
    });
  }, [feedItems, token]);

  return {
    counties,
    loading,
    error,
    reload: loadCounties,
  };
};

export const useCountyDetail = (
  countyId?: string,
  seedCounty?: CountyListItem | null,
) => {
  const {token} = useAuth();
  const [county, setCounty] = useState<CountyListItem | null>(
    () => seedCounty ?? null,
  );
  const [connectedUsers, setConnectedUsers] = useState<
    Awaited<ReturnType<typeof getCountyConnectedUsers>>
  >([]);
  const [loading, setLoading] = useState(() => !seedCounty);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGenerationRef = useRef(0);
  const seedRef = useRef(seedCounty);

  useEffect(() => {
    seedRef.current = seedCounty;
    if (seedCounty) {
      setCounty(prev => (prev?.id === seedCounty.id ? prev : seedCounty));
    }
  }, [seedCounty]);

  const load = useCallback(async () => {
    if (!token || !countyId) {
      loadGenerationRef.current += 1;
      setCounty(null);
      setConnectedUsers([]);
      setError(null);
      setLoading(false);
      setLoadingUsers(false);
      return;
    }

    const generation = ++loadGenerationRef.current;
    const seed = seedRef.current?.id === countyId ? seedRef.current : null;
    if (seed) {
      setCounty(seed);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setLoadingUsers(true);
    setError(null);

    try {
      if (seed) {
        // Seed already has hero/stats — fetch users first for a fast paint,
        // then refresh county metadata without re-fetching users.
        const users = await getCountyConnectedUsers(token, countyId);
        if (generation !== loadGenerationRef.current) {
          return;
        }
        setConnectedUsers(users);
        setLoadingUsers(false);
        setCounty(
          buildCountyListItem(
            seed,
            users.length,
            seed.lastActiveAt,
            Date.now(),
          ),
        );

        void refreshCountyListItem(token, countyId, users.length)
          .then(refreshed => {
            if (generation !== loadGenerationRef.current) {
              return;
            }
            setCounty(refreshed);
          })
          .catch(() => {
            // Keep seeded data if background refresh fails.
          });
        return;
      }

      const detail = await getCountyDetail(token, countyId);
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setCounty(detail.county);
      setConnectedUsers(detail.connectedUsers);
    } catch (loadError) {
      if (generation !== loadGenerationRef.current) {
        return;
      }
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load county details.',
      );
    } finally {
      if (generation === loadGenerationRef.current) {
        setLoading(false);
        setLoadingUsers(false);
      }
    }
  }, [countyId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    county,
    connectedUsers,
    loading,
    loadingUsers,
    error,
    reload: load,
  };
};
