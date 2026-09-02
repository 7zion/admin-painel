export function calculateReadingTime(content?: string, summary?: string): string {
  const fullText = `${summary || ''} ${content || ''}`.replace(/<[^>]+>/g, ' ');
  const words = fullText.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return '1 min de leitura';
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min de leitura`;
}
