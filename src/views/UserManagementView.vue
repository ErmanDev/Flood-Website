<template>
  <AdminLayout @refresh="fetchUsers">
    <v-card height="calc(100vh - 100px)" class="d-flex flex-column">
      <v-card-title class="d-flex align-center flex-grow-0">
        User Management
        <v-spacer></v-spacer>
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Filter by Status"
          density="compact"
          hide-details
          class="mr-4 flex-grow-0"
          style="width: 200px"
          clearable
        ></v-select>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          density="compact"
          class="flex-grow-0"
          style="width: 300px"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        :search="search"
        class="elevation-1 flex-grow-1 overflow-y-auto"
        fixed-header
      >
        <template v-slot:item.profileImage="{ value, item }">
          <v-avatar size="40" :color="value ? undefined : 'primary'">
            <v-img
              v-if="value"
              :src="value"
              :alt="item.username"
              cover
            ></v-img>
            <span v-else class="text-subtitle-1 font-weight-bold">{{ item.firstName?.charAt(0) }}{{ item.lastName?.charAt(0) }}</span>
          </v-avatar>
        </template>
        <template v-slot:item.status="{ value }">
          <v-chip
            :color="getStatusColor(value)"
            text-color="white"
            size="small"
            variant="flat"
          >
            {{ value }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="editUser(item)"
          >
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">Edit User</v-tooltip>
          </v-btn>
        </template>
        
        <template v-slot:no-data>
           <div class="text-center py-4">No users found</div>
        </template>

      </v-data-table>

      <!-- Edit User Dialog -->
      <v-dialog v-model="editDialog" max-width="500px">
        <v-card v-if="selectedUser">
          <v-card-title class="text-h5 pa-4">
            Edit User
          </v-card-title>
          
          <v-card-text>
            <div class="d-flex flex-column align-center mb-6">
              <v-avatar size="100" class="mb-3" :color="selectedUser.profileImage ? undefined : 'primary'">
                <v-img 
                  v-if="selectedUser.profileImage" 
                  :src="selectedUser.profileImage" 
                  cover
                ></v-img>
                <span v-else class="text-h4 font-weight-bold text-white">
                  {{ selectedUser.firstName?.charAt(0) }}{{ selectedUser.lastName?.charAt(0) }}
                </span>
              </v-avatar>
              
              <div class="text-h6">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</div>
              <div class="text-body-2 text-grey">{{ selectedUser.username }}</div>
              <div class="text-body-2 text-grey">{{ selectedUser.email }}</div>
            </div>

            <v-select
              v-model="selectedUser.status"
              :items="statusOptions"
              label="Account Status"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              prepend-inner-icon="mdi-account-check"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :color="getStatusColor(item.value)">mdi-circle-small</v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-card-text>

          <v-card-actions class="pa-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="editDialog = false"
              :disabled="isSaving"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              @click="updateStatus"
              :loading="isSaving"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/components/AdminLayout.vue'
import { api } from '@/services/api'
import type { User } from '@/types'

const users = ref<User[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref<string | null>(null)

// Dialog state
const editDialog = ref(false)
const selectedUser = ref<User | null>(null)
const isSaving = ref(false)

const statusOptions = ['Verified', 'Pending Verification', 'Rejected']

const filteredUsers = computed(() => {
  if (!statusFilter.value) return users.value
  return users.value.filter(user => user.status === statusFilter.value)
})

const headers = [
  { title: 'Profile Image', key: 'profileImage', align: 'center' as const, sortable: false },
  { title: 'Username', key: 'username', align: 'start' as const },
  { title: 'First Name', key: 'firstName', align: 'start' as const },
  { title: 'Last Name', key: 'lastName', align: 'start' as const },
  { title: 'Phone', key: 'phone', align: 'start' as const },
  { title: 'Email', key: 'email', align: 'start' as const },
  { title: 'Address', key: 'address', align: 'start' as const },
  { title: 'Status', key: 'status', align: 'center' as const },
  { title: 'Actions', key: 'actions', align: 'center' as const, sortable: false },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Verified': return 'success'
    case 'Pending Verification': return 'warning'
    case 'Rejected': return 'error'
    default: return 'grey'
  }
}

const editUser = (user: User) => {
  selectedUser.value = { ...user } // Create a copy to avoid direct mutation
  editDialog.value = true
}

const updateStatus = async () => {
  if (!selectedUser.value || !selectedUser.value._id) return

  isSaving.value = true
  try {
    await api.updateUserStatus(selectedUser.value._id, selectedUser.value.status)
    // Refresh user list
    await fetchUsers()
    editDialog.value = false
  } catch (error) {
    console.error('Error updating status:', error)
    // You might want to show a toast/snackbar error here
  } finally {
    isSaving.value = false
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await api.getUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>