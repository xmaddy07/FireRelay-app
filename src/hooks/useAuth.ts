import {useAppSelector} from '../redux/hooks';

export const useAuth = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = useAppSelector(state => state.auth.token);
  const sessionId = useAppSelector(state => state.auth.sessionId);

  return {isAuthenticated, token, sessionId};
};
