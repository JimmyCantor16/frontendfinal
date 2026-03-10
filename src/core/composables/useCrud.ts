import { ref, computed, type Ref } from 'vue'
import api from '@core/api/client'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import { useDebouncedRef } from '@core/utils/debounce'

interface UseCrudOptions<T, F> {
  endpoint: string
  entityName: string
  defaultForm: () => F
  searchFilter?: (item: T, query: string) => boolean
}

export function useCrud<T extends { id: number }, F>(options: UseCrudOptions<T, F>) {
  const items: Ref<T[]> = ref([])
  const search = ref('')
  const showForm = ref(false)
  const editingId: Ref<number | null> = ref(null)
  const form: Ref<F> = ref(options.defaultForm()) as Ref<F>
  const loading = ref(false)
  const saving = ref(false)

  const debouncedSearch = useDebouncedRef(search, 300)

  const filtered = computed(() => {
    const q = debouncedSearch.value.toLowerCase()
    if (!q || !options.searchFilter) return items.value
    return items.value.filter((item) => options.searchFilter!(item, q))
  })

  async function fetchData(): Promise<void> {
    loading.value = true
    try {
      const { data } = await api.get(options.endpoint)
      const raw = data.data ?? data
      items.value = Array.isArray(raw) ? raw : []
    } catch (err) {
      notifyApiError(err, `Error al cargar ${options.entityName.toLowerCase()}s`)
    } finally {
      loading.value = false
    }
  }

  function openForm(): void {
    editingId.value = null
    form.value = options.defaultForm()
    showForm.value = true
  }

  function editItem(item: T, mapFn: (item: T) => F): void {
    editingId.value = item.id
    form.value = mapFn(item)
    showForm.value = true
  }

  async function save(): Promise<void> {
    if (saving.value) return
    saving.value = true
    try {
      if (editingId.value) {
        await api.put(`${options.endpoint}/${editingId.value}`, form.value as Record<string, unknown>)
        notifySuccess(`${options.entityName} actualizado`)
      } else {
        await api.post(options.endpoint, form.value as Record<string, unknown>)
        notifySuccess(`${options.entityName} creado`)
      }
      showForm.value = false
      await fetchData()
    } catch (err) {
      notifyApiError(err, `Error al guardar ${options.entityName.toLowerCase()}`)
    } finally {
      saving.value = false
    }
  }

  async function remove(id: number): Promise<void> {
    const confirmed = await confirmAction(
      `¿Eliminar ${options.entityName.toLowerCase()}?`,
      'Esta acción no se puede deshacer',
      'Eliminar'
    )
    if (confirmed) {
      try {
        await api.delete(`${options.endpoint}/${id}`)
        notifySuccess('Eliminado')
        await fetchData()
      } catch (err) {
        notifyApiError(err, 'No se pudo eliminar')
      }
    }
  }

  return {
    items,
    search,
    showForm,
    editingId,
    form,
    loading,
    saving,
    filtered,
    fetchData,
    openForm,
    editItem,
    save,
    remove,
  }
}
