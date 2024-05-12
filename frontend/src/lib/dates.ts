export function toDateTimeLocal(d: string) {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}

export function toDateString(d: string) {
  const copy = new Date(d);
  return copy.toUTCString();
}

const dateOnlyFormatter = new Intl.DateTimeFormat('default', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
});

export function formatDateOnly(d: Date) {
  return dateOnlyFormatter.format(d);
}

const dateTimeFormatter = new Intl.DateTimeFormat('default', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(d: Date) {
  return dateTimeFormatter.format(d);
}
