import {useState, useEffect} from 'react';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(false);
  }, []);

  return {connected};
};
