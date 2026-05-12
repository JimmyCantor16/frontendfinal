<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-8 text-center">
          <v-icon size="80" color="warning">mdi-cancel</v-icon>
          <h2 class="text-h5 mt-4 mb-2">Checkout cancelado</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            No se procesó ningún pago. Puedes volver a intentarlo cuando quieras.
          </p>
          <div class="d-flex flex-wrap justify-center ga-2">
            <v-btn color="primary" prepend-icon="mdi-package-variant" to="/plans">
              Ver planes
            </v-btn>
            <v-btn variant="outlined" to="/dashboard">
              Ir al dashboard
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
</script>
