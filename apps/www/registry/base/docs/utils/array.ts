// Array.prototype.findLast and findLastIndex are ES2023, which TypeScript
// configs targeting ES2022 (such as shadcn/ui's monorepo template) don't
// include, so docscn uses these instead.

export function findLastIndex<T>(
  items: readonly T[],
  predicate: (item: T) => unknown,
): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i]!)) return i;
  }
  return -1;
}

export function findLast<T, S extends T>(
  items: readonly T[],
  predicate: (item: T) => item is S,
): S | undefined;
export function findLast<T>(
  items: readonly T[],
  predicate: (item: T) => unknown,
): T | undefined;
export function findLast<T>(
  items: readonly T[],
  predicate: (item: T) => unknown,
): T | undefined {
  const index = findLastIndex(items, predicate);
  return index === -1 ? undefined : items[index];
}
