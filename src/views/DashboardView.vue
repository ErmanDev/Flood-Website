<template>
  <AdminLayout @refresh="loadStats">
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4">Loading dashboard...</div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <v-alert type="error" class="mb-4">{{ error }}</v-alert>
      <v-btn color="primary" @click="loadStats">Retry</v-btn>
    </div>

    <div v-else>
      <!-- Pinned Areas Alert -->
      <v-alert
        v-if="stats?.totals.pinnedAreas && stats.totals.pinnedAreas > 0"
        type="error"
        variant="tonal"
        class="mb-6 cursor-pointer"
        border="start"
        elevation="2"
        @click="router.push({ name: 'pinned-areas' })"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-map-marker-alert" size="large"></v-icon>
        </template>
        <div class="d-flex align-center justify-space-between w-100">
          <div>
            <div class="text-h6">Active Pinned Area Alert</div>
            <div>There are currently {{ stats.totals.pinnedAreas }} pinned locations requiring attention. Click to view map.</div>
          </div>
          <v-btn
            color="error"
            variant="flat"
            :to="{ name: 'pinned-areas' }"
          >
            View Map
          </v-btn>
        </div>
      </v-alert>

      <h1 class="text-h4 mb-6">Dashboard Overview</h1>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Total Logs"
            :value="stats?.totals.logs || 0"
            icon="mdi-file-document-multiple"
            color="info"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Pinned Areas"
            :value="stats?.totals.pinnedAreas || 0"
            icon="mdi-map-marker-multiple"
            color="success"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Sensor Readings"
            :value="stats?.totals.sensorReadings || 0"
            icon="mdi-water"
            color="primary"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatsCard
            title="Logs (24h)"
            :value="stats?.recent.logsLast24h || 0"
            icon="mdi-clock-outline"
            color="warning"
          />
        </v-col>
      </v-row>

      <!-- Sensor Status and LED Status Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Sensor Status</v-card-title>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar
                  :color="sensorStatusColor"
                  size="64"
                  class="mr-4"
                >
                  <v-icon
                    :icon="sensorStatusIcon"
                    size="32"
                    color="white"
                  ></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h5 mb-1">
                    {{ sensorStatusText }}
                  </div>
                  <div class="text-body-1 text-medium-emphasis mb-1">
                    {{ sensorStatus?.message || 'Unknown status' }}
                  </div>
                  <div v-if="sensorStatus?.lastReadingTime" class="text-caption text-medium-emphasis">
                    Last reading: {{ formatDate(sensorStatus.lastReadingTime) }}
                  </div>
                </div>
                <v-chip
                  :color="sensorStatusColor"
                  size="large"
                  variant="flat"
                >
                  {{ sensorStatus?.status?.toUpperCase() || 'UNKNOWN' }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            :style="{ backgroundColor: ledStatusColor, color: ledTextColor }"
            :class="['led-status-card', { 'led-blink': shouldBlinkLed }]"
          >
            <v-card-title style="color: inherit;">LED Status</v-card-title>
            <v-card-text style="color: inherit;">
              <div class="d-flex align-center">
                <v-avatar
                  :color="ledStatusColor"
                  size="64"
                  class="mr-4"
                  style="border: 2px solid rgba(255, 255, 255, 0.5);"
                >
                  <v-icon
                    icon="mdi-led-on"
                    size="32"
                    color="white"
                  ></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h5 mb-1" style="color: inherit;">
                    {{ ledStatusText }}
                  </div>
                  <div class="text-body-1 mb-1" style="opacity: 0.9;">
                    {{ ledStatus?.message || 'No LED data available' }}
                  </div>
                </div>
                <v-chip
                  :color="ledStatusColor"
                  size="large"
                  variant="flat"
                  style="color: white;"
                >
                  {{ ledStatus?.status?.toUpperCase() || 'UNKNOWN' }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Log Types Breakdown -->
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Log Types</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-water" color="info" class="mr-2"></v-icon>
                <span class="flex-grow-1">Sensor Logs</span>
                <strong>{{ stats?.logTypes.sensor || 0 }}</strong>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-account" color="success" class="mr-2"></v-icon>
                <span class="flex-grow-1">User Actions</span>
                <strong>{{ stats?.logTypes.userAction || 0 }}</strong>
              </div>
              <div class="d-flex align-center">
                <v-icon icon="mdi-cog" color="warning" class="mr-2"></v-icon>
                <span class="flex-grow-1">System Events</span>
                <strong>{{ stats?.logTypes.systemEvent || 0 }}</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>Latest Sensor Reading</v-card-title>
            <v-card-text v-if="latestSensorReading">
              <div class="text-h6 mb-2">
                Water Level: {{ formatWaterLevel(latestSensorReading) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(latestSensorReading.timestamp) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Source: {{ latestSensorReading.source }}
              </div>
            </v-card-text>
            <v-card-text v-else>
              <div class="text-medium-emphasis">No sensor readings available</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-card>
        <v-card-title>Recent Activity</v-card-title>
        <v-card-text>
          <div v-if="stats?.recentActivity && stats.recentActivity.length > 0">
            <LogCard
              v-for="log in stats.recentActivity"
              :key="log.id"
              :log="log"
            />
          </div>
          <div v-else class="text-medium-emphasis">No recent activity</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :to="{ name: 'logs' }">View All Logs</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/AdminLayout.vue'
import StatsCard from '@/components/StatsCard.vue'
import LogCard from '@/components/LogCard.vue'
import api from '@/services/api'
import type { DashboardStats, SensorReading } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const stats = ref<DashboardStats | null>(null)
const sensorStatus = ref<{
  connected: boolean
  status: 'online' | 'offline' | 'error'
  message: string
  lastReadingTime: string | null
} | null>(null)
const ledStatus = ref<{
  color: string
  status: string
  message: string
} | null>(null)
const latestSensorReading = ref<SensorReading | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
let healthPollInterval: number | null = null

const POLL_INTERVAL_MS = 5000 // Poll every 5 seconds
const OFFLINE_THRESHOLD_MS = 60000 // 1 minute timeout

const checkSensorStaleness = (status: any, currentLedStatus: any) => {
  if (!status) return { sensor: status, led: currentLedStatus }
  
  // If backend says it's already offline or error, respect that
  if (status.status !== 'online') return { sensor: status, led: currentLedStatus }
  
  // If online but no lastReadingTime, it's possibly waiting for first data
  if (!status.lastReadingTime) return { sensor: status, led: currentLedStatus }

  const lastReading = dayjs(status.lastReadingTime)
  const now = dayjs()
  const diff = now.diff(lastReading, 'millisecond')
  
  if (diff > OFFLINE_THRESHOLD_MS) {
    return {
      sensor: {
        ...status,
        connected: false,
        status: 'offline',
        message: `Sensor offline (No data for ${Math.round(diff / 1000)}s)`
      },
      led: {
        color: 'grey',
        status: 'unknown',
        message: 'Sensor offline - LED Off'
      }
    }
  }
  
  return { sensor: status, led: currentLedStatus }
}

const loadSensorStatus = async () => {
  try {
    const health = await api.getHealth()
    const result = checkSensorStaleness(health.sensor, health.led)
    sensorStatus.value = result.sensor
    ledStatus.value = result.led
  } catch (err: any) {
    console.error('Error loading sensor status:', err)
    // Don't set error state for polling failures, just log it
  }
}

const loadLatestSensorReading = async () => {
  try {
    const reading = await api.getLatestSensorReading()
    latestSensorReading.value = reading
  } catch (err: any) {
    console.error('Error loading latest sensor reading:', err)
    // Don't set error state for polling failures, just log it
  }
}

const loadStats = async () => {
  loading.value = true
  error.value = null
  try {
    // Fetch dashboard stats, health status, and latest reading in parallel
    const [dashboardStats, health, reading] = await Promise.all([
      api.getDashboardStats(),
      api.getHealth(),
      api.getLatestSensorReading().catch(() => null) // Don't fail if reading fetch fails
    ])
    stats.value = dashboardStats
    const result = checkSensorStaleness(health.sensor, health.led)
    sensorStatus.value = result.sensor
    ledStatus.value = result.led
    // ledStatus.value = health.led // This line was redundant/conflicting
    if (reading) {
      latestSensorReading.value = reading
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard statistics'
    console.error('Error loading stats:', err)
  } finally {
    loading.value = false
  }
}

const formatWaterLevel = (reading: any) => {
  if (reading.water_level_cm !== null) {
    return `${reading.water_level_cm} cm`
  }
  if (reading.water_level_ft !== null) {
    return `${reading.water_level_ft} ft`
  }
  if (reading.distance !== null) {
    return `${reading.distance} cm`
  }
  if (reading.distance_ft !== null) {
    return `${reading.distance_ft} ft`
  }
  return 'N/A'
}

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('MMM DD, YYYY HH:mm:ss')
}

const sensorStatusColor = computed(() => {
  if (!sensorStatus.value) return 'grey'
  
  switch (sensorStatus.value.status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'error'
    case 'error':
      return 'error'
    default:
      return 'grey'
  }
})

const sensorStatusIcon = computed(() => {
  if (!sensorStatus.value) return 'mdi-help-circle'
  
  switch (sensorStatus.value.status) {
    case 'online':
      return 'mdi-check-circle'
    case 'offline':
      return 'mdi-close-circle'
    case 'error':
      return 'mdi-alert'
    default:
      return 'mdi-help-circle'
  }
})

const sensorStatusText = computed(() => {
  if (!sensorStatus.value) return 'Unknown Status'
  
  switch (sensorStatus.value.status) {
    case 'online':
      return 'Sensor Online'
    case 'offline':
      return 'Sensor Offline'
    case 'error':
      return 'Sensor Error'
    default:
      return 'Unknown Status'
  }
})

const ledStatusColor = computed(() => {
  if (!ledStatus.value) return '#9e9e9e' // grey
  
  const colorMap: Record<string, string> = {
    red: '#f44336',
    orange: '#ff9800',
    green: '#4caf50',
    blue: '#2196f3',
    grey: '#9e9e9e'
  }
  
  return colorMap[ledStatus.value.color] || '#9e9e9e'
})

const ledTextColor = computed(() => {
  // Use white text for colored backgrounds, dark text for light backgrounds
  if (!ledStatus.value) return '#ffffff'
  
  const lightColors = ['green', 'blue']
  return lightColors.includes(ledStatus.value.color) ? '#ffffff' : '#ffffff'
})

const ledStatusText = computed(() => {
  if (!ledStatus.value) return 'LED Unknown'
  
  switch (ledStatus.value.status) {
    case 'danger':
      return 'LED: Danger'
    case 'warning':
      return 'LED: Warning'
    case 'normal':
      return 'LED: Normal'
    case 'info':
      return 'LED: Info'
    default:
      return 'LED: Unknown'
  }
})

const shouldBlinkLed = computed(() => {
  if (!ledStatus.value) return false
  // Blink when LED is red (danger) or orange (warning)
  return ledStatus.value.color === 'red' || ledStatus.value.color === 'orange'
})

onMounted(() => {
  loadStats()
  
  // Start polling sensor status and latest reading in real-time
  healthPollInterval = window.setInterval(() => {
    loadSensorStatus()
    loadLatestSensorReading()
  }, POLL_INTERVAL_MS)
})

onUnmounted(() => {
  // Clean up interval when component is unmounted
  if (healthPollInterval !== null) {
    clearInterval(healthPollInterval)
    healthPollInterval = null
  }
})
</script>

<style scoped>
.led-status-card {
  transition: background-color 0.5s ease;
}

.led-status-card :deep(.v-card-title),
.led-status-card :deep(.v-card-text) {
  color: inherit;
}

.led-blink {
  animation: slowBlink 2s ease-in-out infinite;
}

@keyframes slowBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
