export function toDateTimeLocal(d: string) {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
}

export function toDateString(d: string) {
  const copy = new Date(d);
  return copy.toUTCString();
}
