/**
 * Parses HH:mm or HH:mm:ss and returns event duration in hours.
 * If end is before start, assumes end is next day.
 */
export function hoursBetweenTimes(startTime: string, endTime: string): number {
  const parse = (t: string) => {
    const parts = t.trim().split(":").map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    return h * 60 + m;
  };
  const startM = parse(startTime);
  let endM = parse(endTime);
  if (endM <= startM) {
    endM += 24 * 60;
  }
  return (endM - startM) / 60;
}

/** USD amount in cents for Stripe (minimum 50 cents). */
export function bookingAmountCents(pricePerHour: number, startTime: string, endTime: string): number {
  const hours = hoursBetweenTimes(startTime, endTime);
  const raw = Math.round(pricePerHour * hours * 100);
  return Math.max(50, raw);
}
