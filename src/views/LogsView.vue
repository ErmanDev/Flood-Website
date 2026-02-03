<template>
  <AdminLayout @refresh="loadLogs">
    <div>
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4">Logs</h1>
        <div class="d-flex">
          <v-btn
            color="error"
            variant="outlined"
            @click="confirmClearLogs"
            :disabled="loading || logs.length === 0"
            :loading="clearing"
            class="mr-2"
          >
            <v-icon icon="mdi-delete-sweep" class="mr-2"></v-icon>
            Clear All Logs
          </v-btn>
          <v-btn color="primary" @click="loadLogs" :loading="loading">
            <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- Filters -->
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.type"
                label="Log Type"
                :items="logTypes"
                clearable
                prepend-inner-icon="mdi-filter"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.startDate"
                label="Start Date"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-start"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.endDate"
                label="End Date"
                type="datetime-local"
                prepend-inner-icon="mdi-calendar-end"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
          <v-btn color="primary" @click="applyFilters" class="mr-2">Apply Filters</v-btn>
          <v-btn variant="outlined" @click="clearFilters">Clear Filters</v-btn>
        
        </v-card-text>
      </v-card>

      <!-- Logs Table -->
      <v-card>
        <v-card-title>
          Logs ({{ pagination?.total || 0 }} total)
        </v-card-title>
        <v-card-text>
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <div v-else-if="error" class="text-center py-12">
            <v-alert type="error">{{ error }}</v-alert>
          </div>
          <div v-else-if="logs.length === 0" class="text-center py-12">
            <div class="text-medium-emphasis">No logs found</div>
          </div>
          <div v-else>
            <LogCard
              v-for="log in filteredLogs"
              :key="log.id"
              :log="log"
              class="mb-2"
            />
          </div>
        </v-card-text>
        <v-card-actions v-if="pagination && pagination.total > 0">
          <v-spacer></v-spacer>
          <div class="text-caption mr-4">
            Showing {{ pagination.offset + 1 }} - {{ pagination.offset + logs.length }} of
            {{ pagination.total }}
          </div>
          <v-btn
            :disabled="pagination.offset === 0"
            @click="previousPage"
            prepend-icon="mdi-chevron-left"
          >
            Previous
          </v-btn>
          <v-btn
            :disabled="!pagination.hasMore"
            @click="nextPage"
            append-icon="mdi-chevron-right"
          >
            Next
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Clear Logs Confirmation Dialog -->
      <v-dialog v-model="clearDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">Clear All Logs?</v-card-title>
          <v-card-text>
            Are you sure you want to delete all logs? This action cannot be undone.
            <div class="mt-2 text-body-2 text-medium-emphasis">
              Total logs to be deleted: {{ pagination?.total || 0 }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="clearDialog = false" :disabled="clearing">
              Cancel
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              @click="clearLogs"
              :loading="clearing"
            >
              Clear All
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import LogCard from '@/components/LogCard.vue'
import api from '@/services/api'
import type { Log, Pagination } from '@/types'

const logs = ref<Log[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(false)
const clearing = ref(false)
const error = ref<string | null>(null)
const clearDialog = ref(false)

const filters = ref({
  type: null as string | null,
  startDate: null as string | null,
  endDate: null as string | null,
  search: null as string | null,
})

const logTypes = [
  { title: 'Sensor', value: 'sensor' },
  { title: 'User Action', value: 'user_action' },
  { title: 'System Event', value: 'system_event' },
]

const filteredLogs = computed(() => {
  if (!filters.value.search) {
    return logs.value
  }

  const searchTerm = filters.value.search.toLowerCase()
  return logs.value.filter(log => {
    const dataStr = JSON.stringify(log.data).toLowerCase()
    return (
      log.type.toLowerCase().includes(searchTerm) ||
      log.source?.toLowerCase().includes(searchTerm) ||
      dataStr.includes(searchTerm)
    )
  })
})

const loadLogs = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {
      limit: 50,
      offset: pagination.value?.offset || 0,
    }

    if (filters.value.type) {
      params.type = filters.value.type
    }

    if (filters.value.startDate) {
      params.startDate = new Date(filters.value.startDate).toISOString()
    }

    if (filters.value.endDate) {
      params.endDate = new Date(filters.value.endDate).toISOString()
    }

    const response = await api.getLogs(params)
    logs.value = response.logs
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.message || 'Failed to load logs'
    console.error('Error loading logs:', err)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value = { ...pagination.value!, offset: 0 } as Pagination
  loadLogs()
}

const clearFilters = () => {
  filters.value = {
    type: null,
    startDate: null,
    endDate: null,
    search: null,
  }
  applyFilters()
}

const nextPage = () => {
  if (pagination.value && pagination.value.hasMore) {
    pagination.value.offset += 50
    loadLogs()
  }
}

const previousPage = () => {
  if (pagination.value && pagination.value.offset > 0) {
    pagination.value.offset = Math.max(0, pagination.value.offset - 50)
    loadLogs()
  }
}

const confirmClearLogs = () => {
  clearDialog.value = true
}

const clearLogs = async () => {
  clearing.value = true
  error.value = null
  try {
    await api.clearLogs()
    clearDialog.value = false
    // Reload logs after clearing
    pagination.value = { total: 0, limit: 50, offset: 0, hasMore: false } as Pagination
    await loadLogs()
  } catch (err: any) {
    error.value = err.message || 'Failed to clear logs'
    console.error('Error clearing logs:', err)
  } finally {
    clearing.value = false
  }
}

onMounted(() => {
  loadLogs()
})
</script>
