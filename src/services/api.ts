import axios from 'axios'
import type { Log, PinnedLocation, SensorReading, DashboardStats, Pagination } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Logs
  async getLogs(params?: {
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{ logs: Log[]; pagination: Pagination }> {
    const response = await apiClient.get('/logs', { params })
    return response.data
  },

  async getLog(id: string): Promise<Log> {
    const response = await apiClient.get(`/logs/${id}`)
    return response.data
  },

  async clearLogs(): Promise<{ message: string; deletedCount: number }> {
    const response = await apiClient.delete('/logs')
    return response.data
  },

  // Pinned Areas
  async getPinnedAreas(): Promise<PinnedLocation[]> {
    const response = await apiClient.get('/pinned-areas')
    return response.data
  },

  async getPinnedArea(id: string): Promise<PinnedLocation> {
    const response = await apiClient.get(`/pinned-areas/${id}`)
    return response.data
  },

  async createPinnedArea(data: {
    latitude: number
    longitude: number
    address?: string
    userId?: string
  }): Promise<PinnedLocation> {
    const response = await apiClient.post('/pinned-areas', data)
    return response.data
  },

  async deletePinnedArea(id: string): Promise<void> {
    await apiClient.delete(`/pinned-areas/${id}`)
  },

  // Sensor Readings
  async getSensorReadings(params?: {
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{ readings: SensorReading[]; pagination: Pagination }> {
    const response = await apiClient.get('/sensor-readings', { params })
    return response.data
  },

  async getLatestSensorReading(): Promise<SensorReading> {
    const response = await apiClient.get('/sensor-readings/latest')
    return response.data
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  // Health
  async getHealth(): Promise<{
    status: string
    picoBaseUrl: string | null
    pollIntervalMs: number
    timestamp: string
    sensor: {
      connected: boolean
      status: 'online' | 'offline' | 'error'
      message: string
      lastReadingTime: string | null
    }
    led: {
      color: string
      status: string
      message: string
    }
  }> {
    const response = await apiClient.get('/health')
    return response.data
  },
}

export default api
