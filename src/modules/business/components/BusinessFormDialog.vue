<template>
  <v-dialog :model-value="modelValue" max-width="600" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="pa-6">
      <v-card-title class="text-h6 text-primary">
        {{ editing ? 'Editar negocio' : 'Nuevo negocio' }}
      </v-card-title>

      <v-form ref="formRef" @submit.prevent="onSubmit">
        <v-text-field
          v-model="form.name"
          label="Nombre del negocio *"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-store"
          class="mb-2"
        />
        <v-text-field
          v-model="form.tax_id"
          label="NIT / RUT / Tax ID"
          prepend-inner-icon="mdi-card-account-details"
          class="mb-2"
        />
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          :rules="form.email ? [rules.email] : []"
          prepend-inner-icon="mdi-email"
          class="mb-2"
        />
        <v-text-field
          v-model="form.phone"
          label="Teléfono"
          prepend-inner-icon="mdi-phone"
          class="mb-2"
        />
        <v-text-field
          v-model="form.address"
          label="Dirección"
          prepend-inner-icon="mdi-map-marker"
          class="mb-2"
        />
        <v-text-field
          v-model="form.logo_url"
          label="URL del logo (opcional)"
          prepend-inner-icon="mdi-image"
          class="mb-2"
        />

        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
          {{ error }}
        </v-alert>

        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="$emit('update:modelValue', false)">
            Cancelar
          </v-btn>
          <v-btn color="primary" type="submit" :loading="saving">
            {{ editing ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { BusinessRecord, BusinessCreatePayload } from '../types/business.types'

const props = defineProps<{
  modelValue: boolean
  editing?: BusinessRecord | null
  saving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: BusinessCreatePayload, id: number | null]
}>()

const formRef = ref()

const rules = {
  required: (v: string) => (!!v && v.trim().length > 0) || 'Campo requerido',
  email: (v: string) => !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

const form = reactive<BusinessCreatePayload>({
  name: '',
  tax_id: '',
  email: '',
  phone: '',
  address: '',
  logo_url: '',
})

function resetForm() {
  form.name = ''
  form.tax_id = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.logo_url = ''
}

function loadFromEditing() {
  if (props.editing) {
    form.name = props.editing.name ?? ''
    form.tax_id = (props.editing.tax_id ?? props.editing.nit ?? '') as string
    form.email = props.editing.email ?? ''
    form.phone = props.editing.phone ?? ''
    form.address = props.editing.address ?? ''
    form.logo_url = props.editing.logo_url ?? ''
  } else {
    resetForm()
  }
}

watch(
  () => [props.modelValue, props.editing],
  () => {
    if (props.modelValue) loadFromEditing()
  },
  { immediate: true }
)

async function onSubmit() {
  if (formRef.value && typeof formRef.value.validate === 'function') {
    const result = await formRef.value.validate()
    const valid = typeof result === 'object' && result !== null && 'valid' in result
      ? (result as { valid: boolean }).valid
      : !!result
    if (!valid) return
  }
  emit('submit', { ...form }, props.editing?.id ?? null)
}
</script>
