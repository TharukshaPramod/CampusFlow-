export function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}
