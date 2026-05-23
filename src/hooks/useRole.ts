import {useAppSelector} from '../redux/hooks';

export const useRole = () => {
  const role = useAppSelector(state => state.user.role) ?? 'user';
  const isAdmin = role === 'admin';

  return {role, isAdmin};
};
