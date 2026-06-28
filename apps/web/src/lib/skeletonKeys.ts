const SKELETON_KEY_POOL = [
  'skeleton-a',
  'skeleton-b',
  'skeleton-c',
  'skeleton-d',
  'skeleton-e',
  'skeleton-f',
  'skeleton-g',
  'skeleton-h',
  'skeleton-i',
  'skeleton-j',
  'skeleton-k',
  'skeleton-l',
  'skeleton-m',
  'skeleton-n',
  'skeleton-o',
  'skeleton-p',
  'skeleton-q',
  'skeleton-r',
  'skeleton-s',
  'skeleton-t',
  'skeleton-u',
  'skeleton-v',
  'skeleton-w',
  'skeleton-x',
  'skeleton-y',
  'skeleton-z',
] as const

export function getSkeletonKeys(count: number) {
  return SKELETON_KEY_POOL.slice(0, count)
}
