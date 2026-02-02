<template>
  <v-card class="mb-2">
    <v-card-text>
      <div class="d-flex align-start">
        <v-avatar :color="logTypeColor" size="40" class="mr-3">
          <v-icon :icon="logTypeIcon" color="white" size="20"></v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-1">
            <v-chip :color="logTypeColor" size="small" class="mr-2">
              {{ log.type }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">
              {{ formatDate(log.timestamp) }}
            </span>
          </div>
          <div class="text-body-2 mb-1">
            <strong>Source:</strong> {{ log.source || 'N/A' }}
          </div>
          <div class="text-body-2">
            <pre class="text-caption">{{ formatData(log.data) }}</pre>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Log } from '@/types'
import dayjs from 'dayjs'

interface Props {
  log: Log
}

const props = defineProps<Props>()

const logTypeColor = computed(() => {
  switch (props.log.type) {
    case 'sensor':
      return 'info'
    case 'user_action':
      return 'success'
    case 'system_event':
      return 'warning'
    default:
      return 'grey'
  }
})

const logTypeIcon = computed(() => {
  switch (props.log.type) {
    case 'sensor':
      return 'mdi-water'
    case 'user_action':
      return 'mdi-account'
    case 'system_event':
      return 'mdi-cog'
    default:
      return 'mdi-information'
  }
})

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('MMM DD, YYYY HH:mm:ss')
}

const formatData = (data: any) => {
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  max-height: 150px;
  overflow-y: auto;
}
</style>
