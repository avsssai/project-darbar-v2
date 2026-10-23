/** Prefix public assets for project hosting while preserving external and fragment URLs. */
export function assetPath(path: string, base = import.meta.env?.BASE_URL ?? '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}
