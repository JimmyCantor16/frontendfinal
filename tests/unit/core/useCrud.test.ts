import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, effectScope } from 'vue'

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('@core/utils/notify', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  notifyApiError: vi.fn(),
  confirmAction: vi.fn(),
}))

vi.mock('@core/utils/debounce', () => ({
  useDebouncedRef: (source: { value: unknown }) => source,
}))

import api from '@core/api/client'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import { useCrud } from '@core/composables/useCrud'

interface TestItem {
  id: number
  name: string
}

interface TestForm {
  name: string
}

const defaultOptions = {
  endpoint: '/test-items',
  entityName: 'Item',
  defaultForm: (): TestForm => ({ name: '' }),
  searchFilter: (item: TestItem, q: string) => item.name.toLowerCase().includes(q),
}

function createCrud() {
  let result: ReturnType<typeof useCrud<TestItem, TestForm>>
  const scope = effectScope()
  scope.run(() => {
    result = useCrud<TestItem, TestForm>(defaultOptions)
  })
  return { crud: result!, scope }
}

describe('useCrud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchData', () => {
    it('fetches and populates items from data.data', async () => {
      const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: items } })

      const { crud, scope } = createCrud()
      await crud.fetchData()

      expect(api.get).toHaveBeenCalledWith('/test-items')
      expect(crud.items.value).toEqual(items)
      expect(crud.loading.value).toBe(false)
      scope.stop()
    })

    it('fetches and populates items from data directly', async () => {
      const items = [{ id: 1, name: 'A' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: items })

      const { crud, scope } = createCrud()
      await crud.fetchData()

      expect(crud.items.value).toEqual(items)
      scope.stop()
    })

    it('handles API error and notifies', async () => {
      const error = new Error('Network error')
      vi.mocked(api.get).mockRejectedValueOnce(error)

      const { crud, scope } = createCrud()
      await crud.fetchData()

      expect(notifyApiError).toHaveBeenCalledWith(error, 'Error al cargar items')
      expect(crud.loading.value).toBe(false)
      scope.stop()
    })
  })

  describe('filtered', () => {
    it('returns all items when search is empty', async () => {
      const items = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: items } })

      const { crud, scope } = createCrud()
      await crud.fetchData()

      expect(crud.filtered.value).toEqual(items)
      scope.stop()
    })

    it('filters items based on search query', async () => {
      const items = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: items } })

      const { crud, scope } = createCrud()
      await crud.fetchData()
      crud.search.value = 'alp'
      await nextTick()

      expect(crud.filtered.value).toEqual([{ id: 1, name: 'Alpha' }])
      scope.stop()
    })

    it('returns empty array when no items match search', async () => {
      const items = [{ id: 1, name: 'Alpha' }]
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: items } })

      const { crud, scope } = createCrud()
      await crud.fetchData()
      crud.search.value = 'xyz'
      await nextTick()

      expect(crud.filtered.value).toEqual([])
      scope.stop()
    })
  })

  describe('openForm / editItem / closeForm', () => {
    it('openForm resets form and shows dialog', () => {
      const { crud, scope } = createCrud()

      crud.openForm()

      expect(crud.showForm.value).toBe(true)
      expect(crud.editingId.value).toBeNull()
      expect(crud.form.value).toEqual({ name: '' })
      scope.stop()
    })

    it('editItem sets editingId and maps item to form', () => {
      const { crud, scope } = createCrud()
      const item: TestItem = { id: 5, name: 'Test' }

      crud.editItem(item, (i) => ({ name: i.name }))

      expect(crud.showForm.value).toBe(true)
      expect(crud.editingId.value).toBe(5)
      expect(crud.form.value).toEqual({ name: 'Test' })
      scope.stop()
    })

    it('closing form via showForm flag', () => {
      const { crud, scope } = createCrud()
      crud.openForm()
      expect(crud.showForm.value).toBe(true)

      crud.showForm.value = false
      expect(crud.showForm.value).toBe(false)
      scope.stop()
    })
  })

  describe('save', () => {
    it('creates a new item via POST when editingId is null', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1, name: 'New' } })
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } })

      const { crud, scope } = createCrud()
      crud.openForm()
      crud.form.value = { name: 'New' }

      await crud.save()

      expect(api.post).toHaveBeenCalledWith('/test-items', { name: 'New' })
      expect(notifySuccess).toHaveBeenCalledWith('Item creado')
      expect(crud.showForm.value).toBe(false)
      expect(crud.saving.value).toBe(false)
      scope.stop()
    })

    it('updates existing item via PUT when editingId is set', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: { id: 5, name: 'Updated' } })
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } })

      const { crud, scope } = createCrud()
      crud.editItem({ id: 5, name: 'Old' }, (i) => ({ name: i.name }))
      crud.form.value = { name: 'Updated' }

      await crud.save()

      expect(api.put).toHaveBeenCalledWith('/test-items/5', { name: 'Updated' })
      expect(notifySuccess).toHaveBeenCalledWith('Item actualizado')
      expect(crud.showForm.value).toBe(false)
      scope.stop()
    })

    it('prevents double submit when saving is true', async () => {
      let resolvePost: (value: unknown) => void
      vi.mocked(api.post).mockImplementation(() => new Promise(r => { resolvePost = r }))

      const { crud, scope } = createCrud()
      crud.openForm()
      crud.form.value = { name: 'Test' }

      // Start first save (will hang)
      const firstSave = crud.save()
      expect(crud.saving.value).toBe(true)

      // Second save should bail out immediately
      await crud.save()
      expect(api.post).toHaveBeenCalledTimes(1)

      // Resolve the pending save
      resolvePost!({ data: { id: 1 } })
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } })
      await firstSave

      scope.stop()
    })

    it('handles save error and notifies', async () => {
      const error = new Error('Save failed')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const { crud, scope } = createCrud()
      crud.openForm()
      crud.form.value = { name: 'Test' }

      await crud.save()

      expect(notifyApiError).toHaveBeenCalledWith(error, 'Error al guardar item')
      expect(crud.saving.value).toBe(false)
      scope.stop()
    })
  })

  describe('remove', () => {
    it('deletes item after confirmation', async () => {
      vi.mocked(confirmAction).mockResolvedValueOnce(true)
      vi.mocked(api.delete).mockResolvedValueOnce({})
      vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } })

      const { crud, scope } = createCrud()
      await crud.remove(3)

      expect(confirmAction).toHaveBeenCalledWith(
        '¿Eliminar item?',
        'Esta acción no se puede deshacer',
        'Eliminar'
      )
      expect(api.delete).toHaveBeenCalledWith('/test-items/3')
      expect(notifySuccess).toHaveBeenCalledWith('Eliminado')
      scope.stop()
    })

    it('does not delete when confirmation is cancelled', async () => {
      vi.mocked(confirmAction).mockResolvedValueOnce(false)

      const { crud, scope } = createCrud()
      await crud.remove(3)

      expect(api.delete).not.toHaveBeenCalled()
      scope.stop()
    })

    it('handles delete error and notifies', async () => {
      const error = new Error('Delete failed')
      vi.mocked(confirmAction).mockResolvedValueOnce(true)
      vi.mocked(api.delete).mockRejectedValueOnce(error)

      const { crud, scope } = createCrud()
      await crud.remove(3)

      expect(notifyApiError).toHaveBeenCalledWith(error, 'No se pudo eliminar')
      scope.stop()
    })
  })
})
