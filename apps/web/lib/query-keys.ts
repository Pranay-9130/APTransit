// One place for React Query keys, so invalidation never misses a spelling.
export const queryKeys = {
  me: ["me"] as const,
  sessionBootstrap: ["session", "bootstrap"] as const,
  places: (q: string) => ["places", q.toLowerCase()] as const,
};
