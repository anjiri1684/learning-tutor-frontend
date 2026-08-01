export function formatInUserTimeZone(dateString: string, timeZone?: string | null): string {
  const date = new Date(dateString);
  try {
    return new Intl.DateTimeFormat([], {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: timeZone || undefined,
    }).format(date);
  } catch {
    return date.toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
  }
}

export function currentTimeZone(userTimeZone?: string | null): string {
  return userTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
}
