import {useAppSelector} from '../redux/hooks';

export const useAuth = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = useAppSelector(state => state.auth.token);

  return {isAuthenticated, token};
};
