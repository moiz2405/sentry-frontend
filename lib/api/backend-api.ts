/**
 * Backend API Client
 *
 * All frontend API calls go through this module.
 * The frontend does NOT access Supabase directly — only the backend API.
 *
 * User-scoped endpoints authenticate via `Authorization: Bearer <userId>`,
 * where userId is the Google sub stored in the NextAuth session.
 * SDK endpoints authenticate via `X-API-Key: <apiKey>`.
 */

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "")

// ============================================================
// Types
// ============================================================

export type App = {
  id: string
  user_id: string
  name: string
  description: string | null
  url?: string | null
  api_key: string
  created_at: string
  updated_at: string
}

export type Log = {
  id: string
  app_id: string
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG" | "CRITICAL"
  message: string
  service: string | null
  raw: string
  logged_at: string
}

export type Analytics = {
  total: number
  by_level: Record<string, number>
  error_rate: number
  warning_rate: number
  last_log_time: string | null
}

export type ServiceHealth = "healthy" | "warning" | "unhealthy"
export type RiskLevel = "low" | "medium" | "high" | "critical"
export type RiskTrend = "increasing" | "stable" | "decreasing" | "insufficient_data"

export type DashboardSummary = {
  services: string[]
  total_services: number
  service_health: Record<string, ServiceHealth>
  at_risk_services: string[]
  severity_distribution: Record<string, Record<string, number>>
  most_common_errors: Record<string, string>
  recent_errors: Record<
    string,
    Array<{
      timestamp: string
      service: string
      error_type: string
      severity_level: string
      line: string
      line_number: number
    }>
  >
  service_risk_scores: Record<string, number>
  service_risk_levels: Record<string, RiskLevel>
  service_risk_confidence: Record<string, number>
  service_risk_trend: Record<string, RiskTrend>
  service_failure_eta_minutes: Record<string, number>
  service_failure_prediction: Record<string, boolean>
  service_risk_reasons: Record<string, string[]>
  service_recommendations: Record<string, string[]>
  first_error_timestamp: Record<string, string>
  latest_error_timestamp: Record<string, string>
  errors_per_10_logs: number[]
  avg_errors_per_10_logs: number
}

export type SyncUserPayload = {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

// ============================================================
// Client class
// ============================================================

class BackendAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = BACKEND_URL
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { userId?: string }
  ): Promise<T> {
    const { userId, ...fetchOptions } = options ?? {}
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    }
    if (userId) {
      headers["Authorization"] = `Bearer ${userId}`
    }

    const response = await fetch(url, { ...fetchOptions, headers })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }))
      throw new Error(
        (error as { detail?: string }).detail ?? `HTTP ${response.status}`
      )
    }

    return response.json() as Promise<T>
  }

  // ──────────────────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────────────────

  /** Sync the signed-in user to the backend DB. */
  async syncUser(payload: SyncUserPayload): Promise<{ status: string; id: string }> {
    return this.request("/users/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // ──────────────────────────────────────────────────────────
  // Apps
  // ──────────────────────────────────────────────────────────

  /** List all apps for the authenticated user. */
  async getApps(userId: string): Promise<App[]> {
    return this.request<App[]>("/apps", { userId })
  }

  /** Get a single app (must belong to the authenticated user). */
  async getApp(appId: string, userId?: string): Promise<App> {
    return this.request<App>(`/apps/${appId}`, { userId })
  }

  /** Create a new app and receive its API key. */
  async createApp(
    data: { name: string; description?: string },
    userId: string
  ): Promise<App> {
    return this.request<App>("/apps", {
      method: "POST",
      body: JSON.stringify(data),
      userId,
    })
  }

  /** Delete an app. */
  async deleteApp(appId: string, userId: string): Promise<{ status: string; app_id: string }> {
    return this.request(`/apps/${appId}`, { method: "DELETE", userId })
  }

  // ──────────────────────────────────────────────────────────
  // Logs
  // ──────────────────────────────────────────────────────────

  /** Get paginated logs for an app. */
  async getLogs(
    appId: string,
    userId: string,
    params?: {
      level?: string
      service?: string
      limit?: number
      offset?: number
    }
  ): Promise<{ logs: Log[]; count: number }> {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()
    return this.request(`/logs/${appId}${qs ? `?${qs}` : ""}`, { userId })
  }

  // ──────────────────────────────────────────────────────────
  // Analytics
  // ──────────────────────────────────────────────────────────

  /** Compute real-time analytics from the logs table. */
  async getAnalytics(appId: string, userId: string): Promise<Analytics> {
    return this.request<Analytics>(`/analytics/${appId}`, { userId })
  }

  // ──────────────────────────────────────────────────────────
  // Summary (AI dashboard)
  // ──────────────────────────────────────────────────────────

  /** Get the latest AI-generated dashboard summary for an app. */
  async getSummary(
    appId: string,
    userId: string
  ): Promise<{ summary: DashboardSummary | null }> {
    return this.request(`/summary/${appId}`, { userId })
  }

  // ──────────────────────────────────────────────────────────
  // Health
  // ──────────────────────────────────────────────────────────

  async healthCheck(): Promise<{ status: string }> {
    return this.request("/health")
  }

  // ──────────────────────────────────────────────────────────
  // Demo app helpers (used by LogRatiosPopover in example app)
  // ──────────────────────────────────────────────────────────

  /** Update log error ratios on the demo backend (example app only). */
  async updateDemoLogRatios(ratios: {
    api: number
    auth: number
    inventory: number
    notification: number
    payment: number
  }): Promise<unknown> {
    const demoUrl = (
      process.env.NEXT_PUBLIC_DEMO_BACKEND_URL || "http://localhost:8000"
    ).replace(/\/$/, "")
    const response = await fetch(`${demoUrl}/logs/ratios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ratios),
    })
    if (!response.ok) throw new Error("Failed to update log ratios")
    return response.json()
  }
}

export const backendAPI = new BackendAPI()
