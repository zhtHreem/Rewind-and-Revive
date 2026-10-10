// Sample (demo) lots never run out: each one has a cycle length, and its current
// closing time is computed from the clock on every request. When a cycle ends the
// lot simply opens again, so a portfolio visitor always sees live auctions.
//
// Real lots (isSample is false) are returned untouched.
const DAY = 24 * 60 * 60 * 1000;

export function applyRollingSchedule(lot, now = Date.now()) {
  if (!lot || !lot.isSample || !lot.cycleDays) return lot;

  const cycle = lot.cycleDays * DAY;
  const anchor = new Date(lot.bidEndTime).getTime(); // closing time of the first cycle
  if (!Number.isFinite(anchor) || cycle <= 0) return lot;

  // The anchor may be in the past or the future; step by whole cycles (forwards or
  // backwards) to the first closing time after "now".
  const cycles = Math.ceil((now - anchor) / cycle);
  let end = anchor + cycles * cycle;
  if (end <= now) end += cycle;

  return {
    ...lot,
    bidStartTime: new Date(end - cycle),
    bidEndTime: new Date(end),
  };
}
