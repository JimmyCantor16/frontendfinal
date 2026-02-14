<template>
  <v-dialog :model-value="modelValue" max-width="450" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="pa-6">
      <v-card-title class="text-h6 text-primary text-center">
        Cerrar Venta — Método de Pago
      </v-card-title>

      <v-card-subtitle class="text-center text-h5 font-weight-bold mt-2">
        {{ formatCOP(total) }}
      </v-card-subtitle>

      <v-card-text class="pt-6">
        <!-- Client selector -->
        <v-autocomplete
          v-model="selectedClient"
          :items="clientOptions"
          item-title="title"
          item-value="value"
          label="Cliente (opcional)"
          prepend-inner-icon="mdi-account"
          clearable
          density="compact"
          variant="outlined"
          no-data-text="Sin clientes registrados"
          class="mb-4"
        />

        <!-- Payment method buttons -->
        <div class="text-body-2 text-medium-emphasis mb-2">Método de pago:</div>
        <v-row>
          <v-col v-for="method in paymentMethods" :key="method.value" cols="6">
            <v-btn
              block
              size="large"
              :color="selected === method.value ? 'primary' : 'grey-lighten-3'"
              :variant="selected === method.value ? 'flat' : 'tonal'"
              class="text-body-2"
              @click="selected = method.value"
            >
              <v-icon start>{{ method.icon }}</v-icon>
              {{ method.label }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-spacer />
        <v-btn
          color="success"
          size="large"
          :disabled="!selected"
          :loading="processing"
          @click="onConfirm"
        >
          Confirmar y Cerrar Venta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatCOP } from '@core/utils/format'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import { usePosStore } from '../store/pos.store'
import { fetchClients } from '@modules/catalog/services/client.service'
import type { PaymentMethod, Client } from '@core/types/models'

defineProps<{
  modelValue: boolean
  total: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const posStore = usePosStore()
const selected = ref<PaymentMethod | ''>('')
const processing = ref(false)
const selectedClient = ref<number | null>(null)
const clients = ref<Client[]>([])

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    title: `${c.name} — ${c.document_type} ${c.document_number}`,
    value: c.id,
  }))
)

const paymentMethods = [
  { value: 'cash' as PaymentMethod, label: 'Efectivo', icon: 'mdi-cash' },
  { value: 'card' as PaymentMethod, label: 'Tarjeta', icon: 'mdi-credit-card' },
  { value: 'transfer' as PaymentMethod, label: 'Transferencia', icon: 'mdi-bank-transfer' },
  { value: 'qr' as PaymentMethod, label: 'QR', icon: 'mdi-qrcode' },
]

async function onConfirm() {
  if (!selected.value) return
  processing.value = true
  try {
    await posStore.closeOrder(selected.value, selectedClient.value)
    notifySuccess('Venta cerrada exitosamente')
    selected.value = ''
    selectedClient.value = null
    emit('update:modelValue', false)
  } catch (err) {
    notifyApiError(err, 'Error al cobrar')
  } finally {
    processing.value = false
  }
}

onMounted(async () => {
  try {
    clients.value = await fetchClients()
  } catch {
    // Clients are optional — fail silently
  }
})
</script>
