/**
 * Backend API Client
 * 
 * All frontend API calls go through this utility.
 * Frontend does NOT access Supabase - only the backend API.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

class BackendAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== APPS ====================

  /**
   * Get all apps for a user
   */
  async getApps(userId: string) {
    return this.request(`/apps?user_id=${userId}`);
  }

  /**
   * Get a specific app by ID
   */
  async getApp(appId: string) {
    return this.request(`/apps/${appId}`);
  }

  /**
   * Create a new app
   */
  async createApp(data: {
    user_id: string;
    name: string;
    description?: string;
  }) {
    return this.request('/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an app
   */
  async deleteApp(appId: string) {
    return this.request(`/apps/${appId}`, {
      method: 'DELETE',
    });
  }

  // ==================== LOGS ====================

  /**
   * Get logs for an app
   */
  async getLogs(appId: string, params?: {
    level?: string;
    limit?: number;
    offset?: number;
    start_time?: string;
    end_time?: string;
  }) {
    const queryParams = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    
    const query = queryParams.toString();
    return this.request(`/logs/${appId}${query ? `?${query}` : ''}`);
  }

  /**
   * Ingest logs (used by SDK, but included for completeness)
   */
  async ingestLogs(data: {
    api_key: string;
    logs: Array<{
      level: string;
      message: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
  }) {
    return this.request('/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== ANALYTICS ====================

  /**
   * Get app health metrics
   */
  async getAppHealth(appId: string) {
    return this.request(`/analytics/health/${appId}`);
  }

  /**
   * Get log statistics
   */
  async getLogStats(appId: string, timeRange?: string) {
    const query = timeRange ? `?time_range=${timeRange}` : '';
    return this.request(`/analytics/stats/${appId}${query}`);
  }

  // ==================== SUMMARY ====================

  /**
   * Get AI-generated log summary
   */
  async getSummary(appId: string, params?: {
    start_time?: string;
    end_time?: string;
    level?: string;
  }) {
    const queryParams = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    
    const query = queryParams.toString();
    return this.request(`/summary/${appId}${query ? `?${query}` : ''}`);
  }

  // ==================== DEMO BACKEND (Example App) ====================
  
  /**
   * Update log ratios for demo backend (example app feature)
   * This is specific to the demo myApp backend
   */
  async updateDemoLogRatios(ratios: {
    api: number;
    auth: number;
    inventory: number;
    notification: number;
    payment: number;
  }) {
    const demoBackendUrl = process.env.NEXT_PUBLIC_DEMO_BACKEND_URL || 'http://localhost:8000';
    const url = `${demoBackendUrl}/logs/ratios`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratios),
      });

      if (!response.ok) {
        throw new Error('Failed to update log ratios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating demo log ratios:', error);
      throw error;
    }
  }

  // ==================== HEALTH ====================

  /**
   * Check backend health
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const backendAPI = new BackendAPI();

// Export types for TypeScript
export type App = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  api_key?: string; // Only returned on creation
  created_at: string;
  updated_at: string;
};

export type Log = {
  id: string;
  app_id: string;
  level: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  source?: string;
  function?: string;
  line_number?: number;
};

export type HealthMetrics = {
  total_logs: number;
  error_rate: number;
  warning_rate: number;
  info_rate: number;
  last_log_time?: string;
  uptime?: number;
};

export type LogStats = {
  total: number;
  by_level: Record<string, number>;
  by_hour?: Array<{ hour: string; count: number }>;
  by_day?: Array<{ day: string; count: number }>;
};
