// A/B Testing utilities

export interface ABTestVariant {
  id: string
  name: string
  surveyId: string
  weight: number // Percentage (0-100)
  questions?: any[] // Variant-specific questions
}

export interface ABTestConfig {
  enabled: boolean
  variants: ABTestVariant[]
  metric: 'completion_rate' | 'response_count' | 'avg_time'
}

export function assignVariant(config: ABTestConfig): ABTestVariant | null {
  if (!config.enabled || !config.variants || config.variants.length === 0) {
    return null
  }

  // Simple weighted random assignment
  const random = Math.random() * 100
  let cumulative = 0

  for (const variant of config.variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return variant
    }
  }

  // Fallback to first variant
  return config.variants[0]
}

export function getVariantFromStorage(surveyId: string): string | null {
  return localStorage.getItem(`ab_variant_${surveyId}`)
}

export function saveVariantToStorage(surveyId: string, variantId: string) {
  localStorage.setItem(`ab_variant_${surveyId}`, variantId)
}

export function trackABTestEvent(
  surveyId: string,
  variantId: string,
  event: 'view' | 'start' | 'complete' | 'abandon'
) {
  // Store events in localStorage (in production, send to analytics)
  const key = `ab_events_${surveyId}_${variantId}`
  const events = JSON.parse(localStorage.getItem(key) || '[]')
  events.push({
    event,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem(key, JSON.stringify(events))
}

export function getABTestResults(surveyId: string, config: ABTestConfig) {
  const results: Record<string, any> = {}

  config.variants.forEach((variant) => {
    const events = JSON.parse(
      localStorage.getItem(`ab_events_${surveyId}_${variant.id}`) || '[]'
    )
    const views = events.filter((e: any) => e.event === 'view').length
    const starts = events.filter((e: any) => e.event === 'start').length
    const completes = events.filter((e: any) => e.event === 'complete').length
    const abandons = events.filter((e: any) => e.event === 'abandon').length

    results[variant.id] = {
      name: variant.name,
      views,
      starts,
      completes,
      abandons,
      completionRate: views > 0 ? (completes / views) * 100 : 0,
      conversionRate: starts > 0 ? (completes / starts) * 100 : 0,
    }
  })

  return results
}

