<template>
  <v-container>
    <h2 class="text-h5 text-primary mb-6">Caja Registradora</h2>

    <!-- Loading -->
    <div v-if="store.loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- No cash register open → Open form -->
    <template v-else-if="!store.isOpen">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="5">
          <v-card class="pa-8 text-center">
            <v-icon size="64" color="warning" class="mb-4">mdi-cash-register</v-icon>
            <v-card-title class="text-h5">No hay caja abierta</v-card-title>
            <v-card-subtitle class="mb-6">
              Debes abrir una caja para comenzar a operar en el POS.
            </v-card-subtitle>

            <v-form @submit.prevent="onOpen">
              <v-text-field
                v-model.number="openingAmount"
                label="Monto Inicial"
                type="number"
                min="0"
                step="100"
                prefix="$"
                :rules="[r => r >= 0 || 'Debe ser >= 0']"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="success"
                size="large"
                block
                prepend-icon="mdi-lock-open"
                :loading="opening"
              >
                Abrir Caja
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Cash register is open → Status + close -->
    <template v-else>
      <v-row>
        <!-- Status card -->
        <v-col cols="12" md="7">
          <v-card class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h6">Caja Activa</div>
                <div class="text-caption text-medium-emphasis">
                  Abierta: {{ formatDate(store.current!.opened_at) }}
                  {{ formatTime(store.current!.opened_at) }}
                </div>
              </div>
              <v-chip color="success" size="large">
                <v-icon start>mdi-check-circle</v-icon>
                Abierta
              </v-chip>
            </div>

            <v-divider class="mb-4" />

            <v-row>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Monto Inicial</div>
                <div class="text-h6">{{ formatCOP(store.current!.opening_amount) }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Ventas Totales</div>
                <div class="text-h6 text-success">{{ formatCOP(store.current!.total_sales ?? 0) }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Órdenes Cerradas</div>
                <div class="text-h6">{{ store.current!.orders_closed ?? 0 }}</div>
              </v-col>
            </v-row>

            <v-row class="mt-2">
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Efectivo</div>
                <div class="font-weight-bold">{{ formatCOP(store.current!.total_cash ?? 0) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Tarjeta</div>
                <div class="font-weight-bold">{{ formatCOP(store.current!.total_card ?? 0) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Transferencia</div>
                <div class="font-weight-bold">{{ formatCOP(store.current!.total_transfer ?? 0) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">QR</div>
                <div class="font-weight-bold">{{ formatCOP(store.current!.total_qr ?? 0) }}</div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Close cash register -->
        <v-col cols="12" md="5">
          <v-card class="pa-6">
            <v-card-title class="text-h6 text-error mb-4">Cerrar Caja</v-card-title>
            <v-form @submit.prevent="onClose">
              <v-text-field
                v-model.number="closingAmount"
                label="Monto en caja (conteo)"
                type="number"
                min="0"
                step="100"
                prefix="$"
                :rules="[r => r >= 0 || 'Debe ser >= 0']"
                class="mb-2"
              />
              <v-textarea
                v-model="closingNotes"
                label="Notas (opcional)"
                rows="3"
                class="mb-2"
              />

              <div v-if="closingAmount > 0" class="mb-4 pa-3 bg-grey-lighten-4 rounded">
                <div class="d-flex justify-space-between text-body-2">
                  <span>Esperado:</span>
                  <span class="font-weight-bold">
                    {{ formatCOP(Number(store.current!.opening_amount ?? 0) + Number(store.current!.total_cash ?? 0)) }}
                  </span>
                </div>
                <div class="d-flex justify-space-between text-body-2">
                  <span>Contado:</span>
                  <span class="font-weight-bold">{{ formatCOP(closingAmount) }}</span>
                </div>
                <v-divider class="my-1" />
                <div class="d-flex justify-space-between text-body-2">
                  <span>Diferencia:</span>
                  <span
                    class="font-weight-bold"
                    :class="closingDifference >= 0 ? 'text-success' : 'text-error'"
                  >
                    {{ closingDifference >= 0 ? '+' : '' }}{{ formatCOP(closingDifference) }}
                  </span>
                </div>
              </div>

              <v-btn
                type="submit"
                color="error"
                block
                size="large"
                prepend-icon="mdi-lock"
                :loading="closing"
              >
                Cerrar Caja
              </v-btn>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCashRegisterStore } from '../store/cash-register.store'
import { formatCOP } from '@core/utils/format'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'

const store = useCashRegisterStore()

const openingAmount = ref(0)
const opening = ref(false)

const closingAmount = ref(0)
const closingNotes = ref('')
const closing = ref(false)

const closingDifference = computed(() => {
  const expected = Number(store.current?.opening_amount ?? 0) + Number(store.current?.total_cash ?? 0)
  return closingAmount.value - expected
})

function formatDate(d: string | undefined | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-CO')
}

function formatTime(d: string | undefined | null): string {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

async function onOpen() {
  opening.value = true
  try {
    await store.openRegister({ opening_amount: openingAmount.value })
    notifySuccess('Caja abierta')
  } catch (err) {
    notifyApiError(err, 'Error al abrir caja')
  } finally {
    opening.value = false
  }
}

async function onClose() {
  const confirmed = await confirmAction(
    '¿Cerrar la caja?',
    'Se generará el resumen de cierre. Esta acción no se puede deshacer.',
    'Cerrar Caja'
  )
  if (!confirmed) return

  closing.value = true
  try {
    await store.closeRegister({
      closing_amount: closingAmount.value,
      notes: closingNotes.value || undefined,
    })
    notifySuccess('Caja cerrada')
    closingAmount.value = 0
    closingNotes.value = ''
  } catch (err) {
    notifyApiError(err, 'Error al cerrar caja')
  } finally {
    closing.value = false
  }
}

onMounted(() => store.loadCurrent())
</script>
