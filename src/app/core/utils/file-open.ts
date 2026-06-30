// Opens a fetched Blob (e.g. an authenticated CV download) in a browser tab.
//
// Resume files are no longer public static URLs — they are streamed from an
// authenticated, tenant-scoped API endpoint, so we must fetch them with the
// Bearer token (the auth interceptor adds it) and then display the resulting
// Blob. Because the fetch is async, we open the tab *synchronously* inside the
// click handler (so popup blockers allow it) and redirect it once the Blob is
// ready.
export function openBlobInWindow(blob: Blob, win: Window | null): void {
  const url = URL.createObjectURL(blob);
  if (win) {
    win.location.href = url;
  } else {
    window.open(url, '_blank');
  }
  // Give the tab time to load before releasing the object URL.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
