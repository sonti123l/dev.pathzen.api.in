type TimeUnit = "s" | "m" | "h" | "d";

export function parseDuration(duration: string | undefined): number {
  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  const match = duration?.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = parseInt(match[1]);
  const unit = match[2] as TimeUnit;

  return value * units[unit];
}
