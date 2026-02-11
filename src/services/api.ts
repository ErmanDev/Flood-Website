import axios from 'axios'
import type { Log, PinnedLocation, SensorReading, DashboardStats, Pagination, User } from '@/types'

const AUTH_API_BASE_URL = 'https://flood-server-02ay.onrender.com/api';
const SENSOR_API_BASE_URL = 'https://flood-backend-7rfe.onrender.com/api';

const authApiClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const sensorApiClient = axios.create({
  baseURL: SENSOR_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {

  // Auth
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await authApiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(data: { username: string; email: string; password: string }): Promise<any> {
    const response = await authApiClient.post('/auth/register', data)
    return response.data
  },

  async getUsers(): Promise<User[]> {
    const response = await authApiClient.get('/users')
    return response.data
  },

  async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await authApiClient.put(`/users/${id}/status`, { status })
    return response.data
  },

  async getLogs(params?: {
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{ logs: Log[]; pagination: Pagination }> {
    const response = await sensorApiClient.get('/logs', { params })
    return response.data
  },

  async getLog(id: string): Promise<Log> {
    const response = await sensorApiClient.get(`/logs/${id}`)
    return response.data
  },

  async clearLogs(): Promise<{ message: string; deletedCount: number }> {
    const response = await sensorApiClient.delete('/logs')
    return response.data
  },

  // Pinned Areas
  async getPinnedAreas(): Promise<PinnedLocation[]> {
    const response = await sensorApiClient.get('/pinned-areas')
    return response.data
  },

  async getPinnedArea(id: string): Promise<PinnedLocation> {
    const response = await sensorApiClient.get(`/pinned-areas/${id}`)
    return response.data
  },

  async createPinnedArea(data: {
    latitude: number
    longitude: number
    address?: string
    userId?: string
  }): Promise<PinnedLocation> {
    const response = await sensorApiClient.post('/pinned-areas', data)
    return response.data
  },

  async deletePinnedArea(id: string): Promise<void> {
    await sensorApiClient.delete(`/pinned-areas/${id}`)
  },

  // Sensor Readings
  async getSensorReadings(params?: {
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): Promise<{ readings: SensorReading[]; pagination: Pagination }> {
    const response = await sensorApiClient.get('/sensor-readings', { params })
    return response.data
  },

  async getLatestSensorReading(): Promise<SensorReading> {
    const response = await sensorApiClient.get('/sensor-readings/latest')
    return response.data
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await sensorApiClient.get('/dashboard/stats')
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
    const response = await sensorApiClient.get('/health')
    return response.data
  },
}

export default api
