import {useState, useEffect} from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(false);
  }, []);

  return {isAuthenticated};
};
