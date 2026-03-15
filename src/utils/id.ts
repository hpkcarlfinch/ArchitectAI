export const makeId = (prefix: string): string => {
  return `${prefix}_${crypto.randomUUID()}`;
};
