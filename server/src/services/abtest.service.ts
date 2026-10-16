export type ExperimentVariant = 'A' | 'B';

export interface ExperimentMetrics {
  variant: ExperimentVariant;
  name: string;
  description: string;
  uniqueImpressions: number;
  uniqueClicks: number;
  ctrPercent: number;
}

// In-memory telemetry event store utilizing Sets to prevent duplicate counting
const telemetryStore = {
  A: {
    impressions: new Set<string>(),
    clicks: new Set<string>(),
  },
  B: {
    impressions: new Set<string>(),
    clicks: new Set<string>(),
  },
};

/**
 * Deterministically assigns a user/session into Experiment Group A or Group B
 */
export function assignExperimentGroup(identifier: string): ExperimentVariant {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B';
}

/**
 * Records an impression or click event for a specific variant
 */
export function trackEvent(params: {
  variant: ExperimentVariant;
  eventType: 'impression' | 'click';
  sessionId: string;
  articleId?: string;
}) {
  const { variant, eventType, sessionId, articleId } = params;
  const store = telemetryStore[variant];
  const eventKey = `${sessionId}:${articleId || 'feed'}`;

  if (eventType === 'impression') {
    store.impressions.add(eventKey);
  } else if (eventType === 'click') {
    store.clicks.add(eventKey);
  }
}

/**
 * Calculates real-time A/B performance metrics and CTR
 */
export function getExperimentMetrics(): {
  experimentName: string;
  metrics: ExperimentMetrics[];
  sampleSizeLimitationNote: string;
} {
  const calcVariant = (
    variant: ExperimentVariant,
    name: string,
    desc: string
  ): ExperimentMetrics => {
    const store = telemetryStore[variant];
    const uniqueImpressions = store.impressions.size || 0;
    const uniqueClicks = store.clicks.size || 0;
    const ctrPercent =
      uniqueImpressions > 0
        ? Math.round((uniqueClicks / uniqueImpressions) * 1000) / 10
        : 0;

    return {
      variant,
      name,
      description: desc,
      uniqueImpressions,
      uniqueClicks,
      ctrPercent,
    };
  };

  return {
    experimentName: 'Recommendation Ranking: Freshness vs Personalization',
    metrics: [
      calcVariant(
        'A',
        'Variant A (Recency-First)',
        'Heavy freshness bias (Recency: 50%, Interest: 25%, Popularity: 25%)'
      ),
      calcVariant(
        'B',
        'Variant B (Personalized-First)',
        'Heavy interest bias (Recency: 15%, Interest: 65%, Popularity: 20%)'
      ),
    ],
    sampleSizeLimitationNote:
      'Notice: In this development environment, metrics illustrate experimental assignment methodology rather than statistically significant statistical power (p < 0.05).',
  };
}
