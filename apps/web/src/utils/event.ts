export const getEventType = (eventValue: unknown): string | null => {
  if (typeof eventValue === 'string') {
    try {
      const parsed = JSON.parse(eventValue) as Record<string, unknown>;
      return (parsed?.type as string) || null;
    } catch {
      return null;
    }
  }
  if (eventValue && typeof eventValue === 'object') {
    return ((eventValue as Record<string, unknown>).type as string) || null;
  }
  return null;
};

export const getEventData = <T>(eventValue: unknown): T | null => {
  if (typeof eventValue === 'string') {
    try {
      const parsed = JSON.parse(eventValue) as Record<string, unknown>;
      return (parsed?.data as T) ?? null;
    } catch {
      return null;
    }
  }
  if (eventValue && typeof eventValue === 'object') {
    return ((eventValue as Record<string, unknown>).data as T) ?? null;
  }
  return null;
};
