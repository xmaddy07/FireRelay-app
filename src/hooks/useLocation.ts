/** Placeholder for location hook — wire to services/permissions/locationPermission */
export const useLocation = () => ({
  coords: null as {latitude: number; longitude: number} | null,
  loading: false,
  error: null as string | null,
});
