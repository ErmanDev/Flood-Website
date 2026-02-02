<template>
  <AdminLayout @refresh="loadPinnedAreas">
    <div>
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4">Pinned Areas</h1>
        <v-btn color="primary" @click="loadPinnedAreas" :loading="loading">
          <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
          Refresh
        </v-btn>
      </div>

      <div v-if="loading && pinnedAreas.length === 0" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4">Loading pinned areas...</div>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <v-alert type="error" class="mb-4">{{ error }}</v-alert>
        <v-btn color="primary" @click="loadPinnedAreas()">Retry</v-btn>
      </div>

      <div v-else>
        <!-- Map View -->
        <v-card class="mb-4" style="position: relative;">
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
            absolute
            top
            style="z-index: 2;"
          ></v-progress-linear>
          <v-card-title>Map View</v-card-title>
          <v-card-text>
            <div ref="mapContainer" class="map-container" style="height: 75vh; border-radius: 4px; z-index: 1;"></div>
          </v-card-text>
        </v-card>

        <!-- List View -->
        <v-card>
          <v-card-title>
            Pinned Locations ({{ pinnedAreas.length }})
          </v-card-title>
          <v-card-text>
            <div v-if="pinnedAreas.length === 0" class="text-center py-12">
              <div class="text-medium-emphasis">No pinned areas found</div>
            </div>
            <div v-else>
              <PinnedAreaCard
                v-for="location in pinnedAreas"
                :key="location.id"
                :location="location"
                @view="viewLocation(location)"
                @delete="confirmDelete(location)"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Table View -->
        <v-card class="mt-4">
          <v-card-title>Table View</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Pinned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="location in pinnedAreas" :key="location.id">
                  <td>{{ location.address || 'Unnamed Location' }}</td>
                  <td>{{ location.latitude.toFixed(6) }}</td>
                  <td>{{ location.longitude.toFixed(6) }}</td>
                  <td>{{ formatDate(location.timestamp) }}</td>
                  <td>
                    <v-btn
                      icon="mdi-eye"
                      variant="text"
                      size="small"
                      @click="viewLocation(location)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click="confirmDelete(location)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Pinned Area?</v-card-title>
        <v-card-text>
          Are you sure you want to delete this location?
          <div v-if="locationToDelete" class="mt-2">
            <strong>{{ locationToDelete.address || 'Unnamed Location' }}</strong>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteLocation" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Location Dialog -->
    <v-dialog v-model="viewDialog" max-width="600">
      <v-card v-if="viewingLocation">
        <v-card-title>Location Details</v-card-title>
        <v-card-text>
          <div class="mb-2">
            <strong>Address:</strong> {{ viewingLocation.address || 'N/A' }}
          </div>
          <div class="mb-2">
            <strong>Latitude:</strong> {{ viewingLocation.latitude }}
          </div>
          <div class="mb-2">
            <strong>Longitude:</strong> {{ viewingLocation.longitude }}
          </div>
          <div class="mb-2">
            <strong>Pinned:</strong> {{ formatDate(viewingLocation.timestamp) }}
          </div>
          <div v-if="viewingLocation.userId" class="mb-2">
            <strong>User ID:</strong> {{ viewingLocation.userId }}
          </div>
          <div class="mt-4">
            <a
              :href="`https://www.google.com/maps?q=${viewingLocation.latitude},${viewingLocation.longitude}`"
              target="_blank"
              class="text-decoration-none"
            >
              <v-btn color="primary">Open in Google Maps</v-btn>
            </a>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import PinnedAreaCard from '@/components/PinnedAreaCard.vue'
import api from '@/services/api'
import type { PinnedLocation } from '@/types'
import dayjs from 'dayjs'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const pinnedAreas = ref<PinnedLocation[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const deleteDialog = ref(false)
const viewDialog = ref(false)
const locationToDelete = ref<PinnedLocation | null>(null)
const viewingLocation = ref<PinnedLocation | null>(null)
const deleting = ref(false)
const mapContainer = ref<HTMLElement | null>(null)

let map: L.Map | null = null
const markers: L.Marker[] = []
let refreshInterval: any = null

const initMap = () => {
  // Check if element exists
  if (!mapContainer.value) return

  // If map already exists, just update it (don't destroy)
  if (map) {
    updateMarkers()
    // Optionally invalidate size if container changed, but usually not needed if not hiding
    map.invalidateSize()
    return
  }

  // Center map on Philippines by default or first point
  // Valencia City, Bukidnon coordinates: 7.9066, 125.0925
  const defaultCenter: L.LatLngExpression = [7.9066, 125.0925]
  
  const center: L.LatLngExpression = pinnedAreas.value.length > 0 
    ? [pinnedAreas.value[0].latitude, pinnedAreas.value[0].longitude]
    : defaultCenter

  // Base Layers
  const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  })

  const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  })

  // Use zoom level 13 for default (city view)
  map = L.map(mapContainer.value, {
    center: center,
    zoom: pinnedAreas.value.length > 0 ? 12 : 13,
    layers: [lightLayer] // Default to light
  })

  // Add Layer Control
  const baseMaps = {
    "Light Mode": lightLayer,
    "Dark Mode": darkLayer
  }
  L.control.layers(baseMaps).addTo(map!)

  // Add Legend
  const legend = new L.Control({ position: 'bottomright' })
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend')
    div.style.backgroundColor = 'white'
    div.style.padding = '10px'
    div.style.borderRadius = '5px'
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)'
    
    const items = [
      { label: 'Pinned Area', color: 'red' },
      { label: 'Hospital', color: 'blue' },
      { label: 'Police', color: 'green' }
    ]

    items.forEach(item => {
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${item.color}.png" style="height: 18px; margin-right: 8px;">
          <span style="font-size: 14px; font-weight: 500;">${item.label}</span>
        </div>
      `
    })
    return div
  }
  legend.addTo(map!)

  // Force map invalidation to ensure tiles render
  setTimeout(() => {
    map?.invalidateSize()
  }, 100)

  updateMarkers()
}

const updateMarkers = () => {
  if (!map) return

  // Clear existing markers
  markers.forEach(marker => marker.remove())
  markers.length = 0

  // Define red icon
  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Add new markers
  pinnedAreas.value.forEach(location => {
    const marker = L.marker([location.latitude, location.longitude], { icon: redIcon })
      .addTo(map!)
      .bindPopup(`
        <div style="font-family: inherit;">
          <strong>${location.address || 'Pinned Location'}</strong><br>
          <span style="font-size: 0.9em; color: #666;">
            Lat: ${location.latitude.toFixed(6)}<br>
            Lng: ${location.longitude.toFixed(6)}
          </span>
        </div>
      `)
    
    markers.push(marker)
  })

  // We could fit bounds here, but typically for auto-refresh we might want to preserve user view
  // unless it's the first load. Let's only center if we have points and map was just created?
  // Or maybe only if the user hasn't moved the map manually.
  // For now, let's just add markers.
}

const loadPinnedAreas = async (isBackground = false) => {
  if (!isBackground) {
    loading.value = true
  }
  error.value = null
  try {
    const newData = await api.getPinnedAreas()
    
    // Check if data changed if needed, but for now just replace
    pinnedAreas.value = newData
    
    // Wait for DOM to update
    nextTick(() => {
      if (!map) {
        // First initialization
        initMap()
      } else {
        // Just update markers
        updateMarkers()
      }
    })
  } catch (err: any) {
    if (!isBackground) {
      error.value = err.message || 'Failed to load pinned areas'
    }
    console.error('Error loading pinned areas:', err)
  } finally {
    loading.value = false
  }
}

const viewLocation = (location: PinnedLocation) => {
  viewingLocation.value = location
  viewDialog.value = true
  
  if (map) {
    map.flyTo([location.latitude, location.longitude], 16)
  }
}

const confirmDelete = (location: PinnedLocation) => {
  locationToDelete.value = location
  deleteDialog.value = true
}

const deleteLocation = async () => {
  if (!locationToDelete.value) return

  deleting.value = true
  try {
    await api.deletePinnedArea(locationToDelete.value.id)
    await loadPinnedAreas()
    deleteDialog.value = false
    locationToDelete.value = null
  } catch (err: any) {
    error.value = err.message || 'Failed to delete pinned area'
    console.error('Error deleting location:', err)
  } finally {
    deleting.value = false
  }
}

const formatDate = (timestamp: string) => {
  return dayjs(timestamp).format('MMM DD, YYYY HH:mm')
}

onMounted(() => {
  loadPinnedAreas()
  
  // Auto refresh every 5 seconds
  refreshInterval = setInterval(() => {
    loadPinnedAreas(true)
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
}
</style>
