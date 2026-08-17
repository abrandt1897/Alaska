/* ============================================================
   Pure helper functions shared by alaska-2026-planner.html and
   the unit tests. Loaded as a plain (non-module) <script> so the
   app keeps working with no build step — functions declared here
   attach to the global scope, same as if they lived inline.
   ============================================================ */

function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function esc(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
}

function groupCatFor(label) {
  if (/lodging/i.test(label)) return 'lodge';
  if (/transport/i.test(label)) return 'trans';
  if (/activities/i.test(label)) return 'act';
  return 'misc';
}

function budgetTotals(budget) {
  const sum = (f) => budget.filter((r) => !r.grp && f(r)).reduce((s, r) => s + r.u * r.q, 0);
  return {
    total: sum(() => true),
    act: sum((r) => r.c === 'act'),
    lodge: sum((r) => r.c === 'lodge'),
  };
}

function gaugePercent(total, high) {
  return high > 0 ? Math.max(0, Math.min(100, (total / high) * 100)) : 0;
}

function budgetVerdict(total, low, high) {
  if (total > high) {
    return {
      status: 'over',
      sub: 'over target',
      text:
        money(total - high) +
        ' over the ceiling. The Denali flight tier is the biggest lever — the $475–615pp spread is $280 for two.',
    };
  }
  if (total < low) {
    return {
      status: 'under',
      sub: 'under target',
      text:
        money(low - total) +
        ' under the floor. Room for a flight upgrade or a nicer night somewhere.',
    };
  }
  return {
    status: 'ok',
    sub: 'on target',
    text: 'Inside the window with ' + money(high - total) + ' of headroom at the ceiling.',
  };
}

function buildRouteUrl(waypoints) {
  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const stops = waypoints.slice(1, -1);
  return (
    'https://www.google.com/maps/dir/?api=1&origin=' +
    encodeURIComponent(origin) +
    '&destination=' +
    encodeURIComponent(destination) +
    '&waypoints=' +
    stops.map(encodeURIComponent).join('%7C') +
    '&travelmode=driving'
  );
}

// UMD-style export guard: the false branch only runs in the browser (where
// utils.js is loaded via <script>), which has no unit tests by design, so
// it's unreachable from Node/Vitest. Annotate it rather than contort a test.
/* v8 ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    money,
    esc,
    groupCatFor,
    budgetTotals,
    gaugePercent,
    budgetVerdict,
    buildRouteUrl,
  };
}
