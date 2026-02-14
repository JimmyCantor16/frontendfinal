<template>
  <v-layout>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppSidebar v-if="!isFullscreen" v-model="drawer" />
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBar from '../components/AppBar.vue'
import AppSidebar from '../components/AppSidebar.vue'

const route = useRoute()
const drawer = ref(true)

const isFullscreen = computed(() => route.meta.fullscreen === true)
</script>
