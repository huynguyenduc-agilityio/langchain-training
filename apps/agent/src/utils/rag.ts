import { RetrievedDocument } from '@/types';

/**
 * Formats a list of retrieved documents into a single string separated by dividers.
 * Returns null if the list is empty or undefined.
 */
export function formatRetrievedDocuments(
  documents?: RetrievedDocument[] | null,
): string | null {
  if (!documents || documents.length === 0) {
    return null;
  }
  return documents.map((d) => d.content).join('\n---\n');
}
