import {useCallback, useEffect, useRef, useState} from 'react';
import type {NotificationRecord} from '../api/mappers/notificationMapper';
import {
  hydrateNotificationAudioTimestamps,
  seedNotificationAudioTimestamps,
} from '../utils/notificationTime';

type Options = {
  enabled?: boolean;
};

export function useNotificationTimestamps(
  token: string | null | undefined,
  {enabled = true}: Options = {},
) {
  const audioTimestampsRef = useRef(new Map<string, string>());
  const resolvedAudioIdsRef = useRef(new Set<string>());
  const [audioTimestampsVersion, setAudioTimestampsVersion] = useState(0);
  const [relativeTimeTick, setRelativeTimeTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = setInterval(() => {
      setRelativeTimeTick(tick => tick + 1);
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [enabled]);

  const ensureTimestampsHydrated = useCallback(
    async (notifications: NotificationRecord[]) => {
      if (!token || notifications.length === 0) {
        return;
      }

      const seeded = seedNotificationAudioTimestamps(
        notifications,
        audioTimestampsRef.current,
      );
      const {added, resolvedIds} = await hydrateNotificationAudioTimestamps(
        token,
        notifications,
        audioTimestampsRef.current,
      );

      resolvedIds.forEach(id => resolvedAudioIdsRef.current.add(id));

      if (seeded || added || resolvedIds.length > 0) {
        setAudioTimestampsVersion(version => version + 1);
      }
    },
    [token],
  );

  return {
    audioTimestamps: audioTimestampsRef.current,
    resolvedAudioIds: resolvedAudioIdsRef.current,
    audioTimestampsVersion,
    relativeTimeTick,
    ensureTimestampsHydrated,
  };
}
