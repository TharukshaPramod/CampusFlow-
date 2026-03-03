export function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export function remove(key: string) {
  localStorage.removeItem(key);
}
