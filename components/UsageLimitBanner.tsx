export function UsageLimitBanner({ used = 0, limit = 3 }: { used?: number; limit?: number }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>{used}/{limit} free guides used this month.</b> Upgrade to Pro for higher limits, saved guides, and exports.</div>
}
