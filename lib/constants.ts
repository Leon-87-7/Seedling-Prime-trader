export const NAV_ITEMS: ReadonlyArray<{
  href: string;
  label: string;
}> = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/watchlist', label: 'Watchlist' },
] as const;
