<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :to="{ name: 'dashboard' }"
          :active="$route.name === 'dashboard'"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-file-document-multiple"
          title="Logs"
          :to="{ name: 'logs' }"
          :active="$route.name === 'logs'"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-map-marker-multiple"
          title="Pinned Areas"
          :to="{ name: 'pinned-areas' }"
          :active="$route.name === 'pinned-areas'"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="User Management"
          :to="{ name: 'user-management' }"
          :active="$route.name === 'user-management'"
        ></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" @click="handleLogout" prepend-icon="mdi-logout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Flood Detection Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" @click="$emit('refresh')"></v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)

defineEmits<{
  refresh: []
}>()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>
