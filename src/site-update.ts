const CHECK_INTERVAL_MS = 60_000;
const VERSION_PARAM = "site-version";
const CHECKED_AT_PARAM = "site-checked-at";

interface SiteVersion {
  version: string;
}

const unregisterLegacyWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const rootScope = `${window.location.origin}/`;
  await Promise.all(registrations
    .filter((registration) => registration.scope === rootScope)
    .map((registration) => registration.unregister()));
};

export const getUpdatedUrl = (href: string, version: string, now: number): string | null => {
  const url = new URL(href);
  const lastAttempt = Number(url.searchParams.get(CHECKED_AT_PARAM));

  // A new deploy may be visible before every GitHub Pages edge has the new HTML.
  if (lastAttempt && now - lastAttempt < CHECK_INTERVAL_MS) {
    return null;
  }

  url.searchParams.set(VERSION_PARAM, version);
  url.searchParams.set(CHECKED_AT_PARAM, String(now));
  return url.toString();
};

export const startSiteUpdateCheck = (buildId: string): void => {
  void unregisterLegacyWorker().catch(() => undefined);

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has(VERSION_PARAM)) {
    currentUrl.searchParams.delete(VERSION_PARAM);
    currentUrl.searchParams.delete(CHECKED_AT_PARAM);
    window.history.replaceState(window.history.state, "", currentUrl.toString());
  }

  let checking = false;
  const check = async (): Promise<void> => {
    if (checking) {
      return;
    }

    checking = true;
    try {
      const response = await fetch(`/site-version.json?at=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const latest: SiteVersion = await response.json();
      if (!latest.version || latest.version === buildId) {
        return;
      }

      const updatedUrl = getUpdatedUrl(window.location.href, latest.version, Date.now());
      if (!updatedUrl) {
        return;
      }

      await unregisterLegacyWorker().catch(() => undefined);

      window.location.replace(updatedUrl);
    } catch (error) {
      // The current page remains usable when offline or during a deploy.
    } finally {
      checking = false;
    }
  };

  void check();
  window.setInterval(() => { void check(); }, CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      void check();
    }
  });
};
