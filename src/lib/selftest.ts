'use client';

/**
 * Teacher self-test runs in its OWN TAB — the sample test plays like a
 * separate site, while the dashboard tab stays exactly where it is behind
 * it (draft open, scroll position kept, nothing lost).
 *
 * Popup-blocker safety: window.open is called synchronously inside the
 * click (browsers only honour it during a live user gesture — after an
 * awaited fetch the gesture may have expired). The blank tab gets a tiny
 * branded loading page, then is pointed at the /?quiz=<id> deep link once
 * the attempt id comes back from the API. If the blocker won anyway, the
 * current tab navigates instead — same destination, same experience.
 */
export async function openSelfTestTab(startAttempt: () => Promise<string>): Promise<void> {
  const win =
    typeof window !== 'undefined' && typeof window.open === 'function' ? window.open('', '_blank') : null;
  if (win && !win.closed) {
    try {
      win.document.write(LOAD_HTML);
    } catch {
      /* about:blank write refused on some browsers — the tab just stays blank for a beat */
    }
  }

  let attemptId: string;
  try {
    attemptId = await startAttempt();
  } catch (e) {
    if (win && !win.closed) win.close();
    throw e;
  }

  const url = `/?quiz=${encodeURIComponent(attemptId)}`;
  if (win && !win.closed) win.location.replace(url);
  else if (typeof window !== 'undefined') window.location.href = url;
}

/* The one-beat loading page for the freshly opened tab — brand green on
 * the app's pale canvas, so it reads as this product before the quiz
 * itself paints. Kept inline: it must render before any bundle loads. */
const LOAD_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Opening your self-test…</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;align-items:center;justify-content:center;background:#f4f8f5;
       font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a2b22}
  .card{text-align:center}
  .ring{width:34px;height:34px;margin:0 auto 14px;border-radius:50%;
        border:3px solid #d7e6dc;border-top-color:#0d7a52;animation:spin .8s linear infinite}
  b{color:#0d7a52}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media (prefers-color-scheme:dark){body{background:#0d1512;color:#dce8e0}
    .ring{border-color:#1f3a2d;border-top-color:#34c98b}b{color:#34c98b}}
</style></head>
<body><div class="card">
  <div class="ring"></div>
  Opening your self-test&hellip;<br>
  <b>gcsebusiness</b>
</div></body></html>`;
