import { useEffect, useState } from 'react';
import type { ProjectMetric } from '@/data/projects';

export const OTNOW_STATS_API = 'https://otnow-stats.sil6428-archtech.workers.dev/api/stats';

export interface OTNowStats {
  generatedAt: string;
  reportingInstallations: number;
  totalItems: number;
}

let cachedStats: OTNowStats | null = null;
let pendingRequest: Promise<OTNowStats> | null = null;

function nonNegativeInteger(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error(`Invalid OTNow ${label}`);
  return number;
}

async function loadOTNowStats(): Promise<OTNowStats> {
  if (cachedStats) return cachedStats;
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetch(OTNOW_STATS_API, { headers: { accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`OTNow statistics returned ${response.status}`);
      const body = (await response.json()) as {
        generatedAt?: unknown;
        summary?: { reportingInstallations?: unknown; totalItems?: unknown };
      };
      const stats = {
        generatedAt: typeof body.generatedAt === 'string' ? body.generatedAt : '',
        reportingInstallations: nonNegativeInteger(body.summary?.reportingInstallations, 'reporting-installation count'),
        totalItems: nonNegativeInteger(body.summary?.totalItems, 'item count')
      };
      cachedStats = stats;
      return stats;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

/** One shared request supplies every OTNow metric on the current page. Static values remain a fallback. */
export function useOTNowStats(): OTNowStats | null {
  const [stats, setStats] = useState<OTNowStats | null>(cachedStats);

  useEffect(() => {
    let active = true;
    void loadOTNowStats()
      .then((next) => {
        if (active) setStats(next);
      })
      .catch(() => {
        // The portfolio remains complete when the independent statistics service is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  return stats;
}

export function liveOTNowMetric(slug: string, metric: ProjectMetric, stats: OTNowStats | null): ProjectMetric {
  if (slug !== 'otnow' || !stats) return metric;
  return {
    ...metric,
    value: stats.totalItems,
    separator: true,
    label: 'Canvas items organized',
    detail: `across ${stats.reportingInstallations.toLocaleString('en-US')} opt-in reporting installations · live aggregate from OTNow · identifiable coursework stays local`
  };
}
