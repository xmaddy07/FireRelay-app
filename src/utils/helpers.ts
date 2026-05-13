export const formatDate = (value: string) => value;
export const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${(`0${seconds % 60}`).slice(-2)}`;
