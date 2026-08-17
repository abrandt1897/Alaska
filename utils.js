/* ============================================================
   Pure helper functions shared by alaska-2026-planner.html and
   the unit tests. Loaded as a plain (non-module) <script> so the
   app keeps working with no build step — functions declared here
   attach to the global scope, same as if they lived inline.
   ============================================================ */

/**
 * @typedef {Object} BudgetRow
 * @property {string} [grp] - group-header label; present only on group-header rows
 * @property {string} [n] - line-item name
 * @property {number} [u] - unit cost
 * @property {number} [q] - quantity
 * @property {'lodge'|'trans'|'act'|'misc'} [c] - category
 * @property {string} [note]
 */

/**
 * @param {number} n
 * @returns {string}
 */
function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/**
 * Coerces arbitrary input to a string, HTML-escaping the sensitive characters.
 * @param {unknown} s
 * @returns {string}
 */
function esc(s) {
  return String(s).replace(
    /[&<>"]/g,
    /* v8 ignore next -- regex guarantees c is always one of the 4 known keys */
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
  );
}

/**
 * @param {string} label
 * @returns {'lodge'|'trans'|'act'|'misc'}
 */
function groupCatFor(label) {
  if (/lodging/i.test(label)) return 'lodge';
  if (/transport/i.test(label)) return 'trans';
  if (/activities/i.test(label)) return 'act';
  return 'misc';
}

/**
 * @param {BudgetRow[]} budget
 * @returns {{total: number, act: number, lodge: number}}
 */
function budgetTotals(budget) {
  const sum = (/** @type {(r: BudgetRow) => boolean} */ f) =>
    budget
      .filter((r) => !r.grp && f(r))
      .reduce(
        /* v8 ignore next -- !r.grp filtering guarantees u/q are always set here */
        (s, r) => s + (r.u ?? 0) * (r.q ?? 0),
        0
      );
  return {
    total: sum(() => true),
    act: sum((r) => r.c === 'act'),
    lodge: sum((r) => r.c === 'lodge'),
  };
}

/**
 * @param {number} total
 * @param {number} high
 * @returns {number}
 */
function gaugePercent(total, high) {
  return high > 0 ? Math.max(0, Math.min(100, (total / high) * 100)) : 0;
}

/**
 * @param {number} total
 * @param {number} low
 * @param {number} high
 * @returns {{status: 'over'|'under'|'ok', sub: string, text: string}}
 */
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

/**
 * @param {string[]} waypoints
 * @returns {string}
 */
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
// TypeScript's checkJs also natively synthesizes `module` for any
// CommonJS-style .js file with a `module.exports =` assignment, typed as
// always-present — it can't model the dual browser/Node reality this guard
// exists for, so the type checker sees both halves of the condition as
// provably truthy.
/* v8 ignore start */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
/* v8 ignore stop */
