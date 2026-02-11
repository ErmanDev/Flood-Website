export interface Log {
  id: string
  type: 'sensor' | 'user_action' | 'system_event'
  data: any
  timestamp: string
  source: string | null
}

export interface PinnedLocation {
  id: string
  latitude: number
  longitude: number
  address: string | null
  timestamp: string
  userId: string | null
}

export interface SensorReading {
  id: string
  distance: number | null
  distance_ft: number | null
  water_level_cm: number | null
  water_level_ft: number | null
  timestamp: string
  source: string
  server_timestamp: string | null
}

export interface SensorStatus {
  status: 'online' | 'offline' | 'stale' | 'error'
  message: string
  isGood: boolean
  lastReadingTime?: string
}

export interface DashboardStats {
  totals: {
    logs: number
    pinnedAreas: number
    sensorReadings: number
  }
  logTypes: {
    sensor: number
    userAction: number
    systemEvent: number
  }
  recent: {
    logsLast24h: number
    latestSensorReading: SensorReading | null
  }
  sensorStatus: SensorStatus
  recentActivity: Log[]
}

export interface Pagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  profileImage: string
  status: 'Verified' | 'Pending Verification' | 'Rejected'
}
