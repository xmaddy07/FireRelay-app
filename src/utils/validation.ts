export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
export const isPasswordStrong = (value: string) => value.length >= 8;
