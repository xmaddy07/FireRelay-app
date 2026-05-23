export const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, ' $1').trim();
