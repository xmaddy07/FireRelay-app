import {useEffect, useRef} from 'react';
import {mapAudioToFeedItem} from '../api/mappers/audioMapper';
import type {ApiAudio} from '../api/types/audio';
import {
  feedItemMatchesSocketFilters,
  type FeedSocketFilters,
} from '../services/socket/feedSocketFilters';
import {socketService} from '../services/socket/socketService';
import type {FeedItem} from '../screens/main/feeds/feedTypes';

type FeedCounty = {
  id?: string;
  name: string;
};

type UseFeedSocketOptions = {
  token: string | null;
  enabled?: boolean;
  counties: FeedCounty[];
  selectedCountyNames: string[];
  filters: FeedSocketFilters | null;
  searchQuery: string;
  onNewAudio: (item: FeedItem) => void;
  onAudioUpdated: (item: FeedItem) => void;
  onAudioDeleted: (payload: {id: string; countyId?: number}) => void;
};

const resolveCountyIdsToJoin = (
  counties: FeedCounty[],
  selectedCountyNames: string[],
): string[] => {
  const withIds = counties.filter(
    (county): county is FeedCounty & {id: string} =>
      typeof county.id === 'string' && county.id.length > 0,
  );

  if (selectedCountyNames.length === 0) {
    return withIds.map(county => county.id);
  }

  const selected = new Set(
    selectedCountyNames.map(name => name.trim().toLowerCase()),
  );

  return withIds
    .filter(county => selected.has(county.name.trim().toLowerCase()))
    .map(county => county.id);
};

const syncCountyRooms = (nextCountyIds: string[], joinedCountyIds: string[]) => {
  const nextSet = new Set(nextCountyIds);
  const joinedSet = new Set(joinedCountyIds);

  joinedCountyIds.forEach(countyId => {
    if (!nextSet.has(countyId)) {
      socketService.leaveCounty(countyId);
    }
  });

  nextCountyIds.forEach(countyId => {
    if (!joinedSet.has(countyId)) {
      socketService.joinCounty(countyId);
    }
  });

  return nextCountyIds;
};

export const useFeedSocket = ({
  token,
  enabled = true,
  counties,
  selectedCountyNames,
  filters,
  searchQuery,
  onNewAudio,
  onAudioUpdated,
  onAudioDeleted,
}: UseFeedSocketOptions) => {
  const onNewAudioRef = useRef(onNewAudio);
  const onAudioUpdatedRef = useRef(onAudioUpdated);
  const onAudioDeletedRef = useRef(onAudioDeleted);
  const filtersRef = useRef(filters);
  const searchQueryRef = useRef(searchQuery);
  const joinedCountyIdsRef = useRef<string[]>([]);
  const countyIdsRef = useRef<string[]>([]);

  useEffect(() => {
    onNewAudioRef.current = onNewAudio;
  }, [onNewAudio]);

  useEffect(() => {
    onAudioUpdatedRef.current = onAudioUpdated;
  }, [onAudioUpdated]);

  useEffect(() => {
    onAudioDeletedRef.current = onAudioDeleted;
  }, [onAudioDeleted]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    countyIdsRef.current = resolveCountyIdsToJoin(
      counties,
      selectedCountyNames,
    );
    if (__DEV__) {
      console.log('[Socket] feed county rooms updated', {
        countyIds: countyIdsRef.current,
        connected: socketService.isConnected(),
      });
    }
    if (socketService.isConnected()) {
      joinedCountyIdsRef.current = syncCountyRooms(
        countyIdsRef.current,
        joinedCountyIdsRef.current,
      );
    }
  }, [counties, selectedCountyNames]);

  useEffect(() => {
    if (!token) {
      joinedCountyIdsRef.current.forEach(countyId => {
        socketService.leaveCounty(countyId);
      });
      joinedCountyIdsRef.current = [];
      return;
    }

    if (!enabled) {
      if (__DEV__) {
        console.log('[Socket] feed waiting for filters before connect');
      }
      joinedCountyIdsRef.current.forEach(countyId => {
        socketService.leaveCounty(countyId);
      });
      joinedCountyIdsRef.current = [];
      return;
    }

    if (__DEV__) {
      console.log('[Socket] feed enabling live connection');
    }
    socketService.connect(token);

    const mapIncomingAudio = (audio: ApiAudio): FeedItem | null => {
      const item = mapAudioToFeedItem(audio);
      if (
        !feedItemMatchesSocketFilters(
          item,
          filtersRef.current,
          searchQueryRef.current,
        )
      ) {
        return null;
      }
      return item;
    };

    const handleConnect = () => {
      joinedCountyIdsRef.current = syncCountyRooms(
        countyIdsRef.current,
        joinedCountyIdsRef.current,
      );
      if (__DEV__) {
        console.log('[Socket] feed joined counties', {
          countyIds: joinedCountyIdsRef.current,
        });
      }
    };

    const handleNewCountyAudio = (payload: unknown) => {
      const item = mapIncomingAudio(payload as ApiAudio);
      if (item) {
        onNewAudioRef.current(item);
      }
    };

    const handleCountyAudioUpdated = (payload: unknown) => {
      const item = mapAudioToFeedItem(payload as ApiAudio);
      const visible = feedItemMatchesSocketFilters(
        item,
        filtersRef.current,
        searchQueryRef.current,
      );
      if (visible) {
        onAudioUpdatedRef.current(item);
      } else {
        onAudioDeletedRef.current({id: item.id});
      }
    };

    const handleAudioDeleted = (payload: unknown) => {
      const record = payload as {id?: string; countyId?: number};
      if (typeof record.id === 'string') {
        onAudioDeletedRef.current({
          id: record.id,
          countyId: record.countyId,
        });
      }
    };

    if (socketService.isConnected()) {
      handleConnect();
    }

    const unsubscribers = [
      socketService.on(socketService.events.connect, handleConnect),
      socketService.on(
        socketService.events.newCountyAudio,
        handleNewCountyAudio,
      ),
      socketService.on(
        socketService.events.countyAudioUpdated,
        handleCountyAudioUpdated,
      ),
      socketService.on(
        socketService.events.audioDeleted,
        handleAudioDeleted,
      ),
      socketService.on(
        socketService.events.countyAudioDeleted,
        handleAudioDeleted,
      ),
      socketService.on(socketService.events.error, payload => {
        if (__DEV__) {
          const message =
            payload &&
            typeof payload === 'object' &&
            'message' in payload &&
            typeof (payload as {message: unknown}).message === 'string'
              ? (payload as {message: string}).message
              : 'Socket error';
          console.warn('[Socket] feed error:', message);
        }
      }),
    ];

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      joinedCountyIdsRef.current.forEach(countyId => {
        socketService.leaveCounty(countyId);
      });
      joinedCountyIdsRef.current = [];
    };
  }, [enabled, token]);
};
