<template>
  <v-container class="fill-height login-container" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-xl pa-4 card-blur" max-width="500">
          <div class="text-center pt-6">
            <v-avatar color="primary" size="80" class="mb-4 elevation-6 pulse-animation">
              <v-icon size="40" color="white">mdi-login</v-icon>
            </v-avatar>
            <h2 class="text-h4 font-weight-bold primary--text mb-2">Welcome Back!</h2>
            <p class="text-subtitle-1 text-medium-emphasis">Please sign in to continue monitoring</p>
          </div>

          <v-card-text>
            <v-expand-transition>
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4 rounded-lg"
                closable
                @click:close="error = ''"
              >
                {{ error }}
              </v-alert>
            </v-expand-transition>

            <v-form @submit.prevent="handleSubmit" class="mt-4">
              <v-text-field
                label="Email"
                v-model="email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                rounded="lg"
                color="primary"
                bg-color="surface"
                hide-details="auto"
                required
              ></v-text-field>

              <v-text-field
                label="Password"
                v-model="password"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                rounded="lg"
                color="primary"
                bg-color="surface"
                hide-details="auto"
                required
              ></v-text-field>

              <v-btn
                block
                color="primary"
                size="large"
                type="submit"
                :loading="loading"
                class="mt-6 rounded-lg font-weight-bold text-uppercase elevation-4"
                height="50"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center pb-6 pt-2">
            <!-- No registration allowed -->
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const router = useRouter()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await api.login({
      email: email.value,
      password: password.value
    })
    
    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: 'Welcome back! Redirecting...',
      life: 3000
    })

    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response))
    
    router.push('/')
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: err.response?.data?.message || err.message || 'An error occurred during login',
      life: 5000
    })
    console.error('Auth error:', err)
    error.value = err.response?.data?.message || err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  position: relative;
  overflow: hidden;
}

/* Optional: Add some background shapes or texture via pseudo-elements if desired, 
   but for now a gradient is clean. */
.login-container::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.login-container::after {
    content: '';
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 70%);
    border-radius: 50%;
    z-index: 0;
}

.card-blur {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.9) !important;
}

.pulse-animation {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
    }
}
</style>
