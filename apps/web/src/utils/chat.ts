export function checkHasVisibleMessages(
  messages: Array<{ role: string; content?: string }> | undefined | null,
): boolean {
  return Boolean(
    messages?.some((m) => {
      if (m.role === 'user') return true;
      if (m.role === 'assistant') return Boolean(m.content?.trim());
      return false;
    }),
  );
}
