export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  const urlParam = new URLSearchParams(window.location.search).get('demo') === 'true';
  const stored = sessionStorage.getItem('cudine_demo') === 'true';
  return urlParam || stored;
}

export function initDemoMode(): void {
  if (new URLSearchParams(window.location.search).get('demo') === 'true') {
    sessionStorage.setItem('cudine_demo', 'true');
  }
}
