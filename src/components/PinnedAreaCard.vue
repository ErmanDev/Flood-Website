<template>
  <v-card>
    <v-card-text>
      <div class="d-flex align-start">
        <v-avatar color="primary" size="40" class="mr-3">
          <v-icon icon="mdi-map-marker" color="white" size="20"></v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-h6 mb-1">
            {{ location.address || 'Unnamed Location' }}
          </div>
          <div class="text-body-2 text-medium-emphasis mb-2">
            <v-icon icon="mdi-latitude" size="16" class="mr-1"></v-icon>
            {{ location.latitude.toFixed(6) }},
            <v-icon icon="mdi-longitude" size="16" class="ml-2 mr-1"></v-icon>
            {{ location.longitude.toFixed(6) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Pinned: {{ formatDate(location.timestamp) }}
          </div>
        </div>
        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" variant="text" v-bind="menuProps"></v-btn>
          </template>
          <v-list>
            <v-list-item @click="$emit('view')">
              <template v-slot:prepend>
                <v-icon icon="mdi-eye"></v-icon>
              </template>
              <v-list-item-title>View on Map</v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('delete')" class="text-error">
              <template v-slot:prepend>
                <v-icon icon="mdi-delete" color="error"></v-icon>
              </template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { PinnedLocation } from '@/types'
import dayjs from 'dayjs'

interface Props {
  location: PinnedLocation
}

defineProps<Props>()

defineEmits<{
  view: []
  delete: []
}>()

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('MMM DD, YYYY HH:mm')
}
</script>
