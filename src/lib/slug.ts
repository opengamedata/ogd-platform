export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'untitled';
}

export function appendShortId(slug: string, id: string) {
  return `${slug}-${id.slice(0, 8)}`;
}
