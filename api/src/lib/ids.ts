import { nanoid } from 'nanoid';

type IdPrefix = 'q' | 'a' | 'c' | 'ag' | 'v';

export function generateId(prefix: IdPrefix): string {
  return `${prefix}_${nanoid(12)}`;
}
