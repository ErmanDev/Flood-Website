<template>
  <v-card>
    <v-card-text>
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-caption text-medium-emphasis">{{ title }}</div>
          <div class="text-h4 mt-2">{{ formattedValue }}</div>
          <div v-if="subtitle" class="text-caption mt-1">{{ subtitle }}</div>
        </div>
        <v-avatar :color="color" size="56" rounded>
          <v-icon :icon="icon" size="32" color="white"></v-icon>
        </v-avatar>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon: string
  color?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>
