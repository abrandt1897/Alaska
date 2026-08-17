import { describe, it, expect } from 'vitest';
import {
  money,
  esc,
  groupCatFor,
  budgetTotals,
  gaugePercent,
  budgetVerdict,
  buildRouteUrl,
} from '../utils.js';

describe('money', () => {
  it('formats whole dollars with thousands separators', () => {
    expect(money(1234)).toBe('$1,234');
  });

  it('rounds to the nearest dollar', () => {
    expect(money(9.6)).toBe('$10');
    expect(money(9.4)).toBe('$9');
  });

  it('handles zero and negative values', () => {
    expect(money(0)).toBe('$0');
    expect(money(-42)).toBe('$-42');
  });
});

describe('esc', () => {
  it('escapes HTML-sensitive characters', () => {
    expect(esc('<b>"Tom" & Jerry</b>')).toBe('&lt;b&gt;&quot;Tom&quot; &amp; Jerry&lt;/b&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(esc('Denali flight')).toBe('Denali flight');
  });

  it('coerces non-string input to a string first', () => {
    expect(esc(42)).toBe('42');
  });
});

describe('groupCatFor', () => {
  it('matches lodging group headers case-insensitively', () => {
    expect(groupCatFor('Lodging — 9 nights')).toBe('lodge');
    expect(groupCatFor('lodging')).toBe('lodge');
  });

  it('matches transport group headers', () => {
    expect(groupCatFor('Transport')).toBe('trans');
  });

  it('matches activities group headers', () => {
    expect(groupCatFor('Activities')).toBe('act');
  });

  it('falls back to misc for anything else', () => {
    expect(groupCatFor('Living & slack')).toBe('misc');
  });
});

describe('budgetTotals', () => {
  /** @type {import('../utils.js').BudgetRow[]} */
  const budget = [
    { grp: 'Lodging' },
    { n: 'Seward', u: 100, q: 3, c: 'lodge' },
    { grp: 'Activities' },
    { n: 'Flight', u: 200, q: 2, c: 'act' },
    { n: 'Fjord cruise', u: 50, q: 2, c: 'act' },
    { grp: 'Living & slack' },
    { n: 'Misc', u: 10, q: 1, c: 'misc' },
  ];

  it('sums unit*qty across non-group rows', () => {
    expect(budgetTotals(budget).total).toBe(300 + 400 + 100 + 10);
  });

  it('sums only the requested category', () => {
    const { act, lodge } = budgetTotals(budget);
    expect(act).toBe(400 + 100);
    expect(lodge).toBe(300);
  });

  it('ignores group-header rows', () => {
    expect(budgetTotals([{ grp: 'Empty group' }]).total).toBe(0);
  });
});

describe('gaugePercent', () => {
  it('scales total against the high target as a percentage', () => {
    expect(gaugePercent(4500, 9000)).toBe(50);
  });

  it('clamps to 100 when total exceeds the target', () => {
    expect(gaugePercent(12000, 9000)).toBe(100);
  });

  it('clamps to 0 for a non-positive target', () => {
    expect(gaugePercent(500, 0)).toBe(0);
  });
});

describe('budgetVerdict', () => {
  it('flags over-budget totals', () => {
    const v = budgetVerdict(9500, 7000, 9000);
    expect(v.status).toBe('over');
    expect(v.sub).toBe('over target');
    expect(v.text).toContain('$500 over the ceiling');
  });

  it('flags under-budget totals', () => {
    const v = budgetVerdict(5000, 7000, 9000);
    expect(v.status).toBe('under');
    expect(v.sub).toBe('under target');
    expect(v.text).toContain('$2,000 under the floor');
  });

  it('flags totals inside the window', () => {
    const v = budgetVerdict(8000, 7000, 9000);
    expect(v.status).toBe('ok');
    expect(v.sub).toBe('on target');
    expect(v.text).toContain('$1,000 of headroom');
  });

  it('treats the exact low and high bounds as inside the window', () => {
    expect(budgetVerdict(7000, 7000, 9000).status).toBe('ok');
    expect(budgetVerdict(9000, 7000, 9000).status).toBe('ok');
  });
});

describe('buildRouteUrl', () => {
  it('builds a Google Maps directions URL with origin, destination, and waypoints', () => {
    const url = buildRouteUrl(['Anchorage, AK', 'Seward, AK', 'Palmer, AK', 'Healy, AK']);
    expect(url).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=Anchorage%2C%20AK&destination=Healy%2C%20AK' +
        '&waypoints=Seward%2C%20AK%7CPalmer%2C%20AK&travelmode=driving'
    );
  });

  it('omits waypoints when there are only an origin and a destination', () => {
    const url = buildRouteUrl(['Anchorage, AK', 'Healy, AK']);
    expect(url).toContain('&waypoints=&travelmode=driving');
  });
});
