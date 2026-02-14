import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, Category } from '@core/types/models'
import { fetchProducts } from '../services/product.service'
import { notifyApiError } from '@core/utils/notify'
import api from '@core/api/client'

export const useInventoryStore = defineStore('inventory', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])

  async function loadProducts(): Promise<void> {
    try {
      const data = await fetchProducts()
      products.value = data
    } catch (err: unknown) {
      notifyApiError(err, 'Error al cargar productos')
    }
  }

  async function loadCategories(): Promise<void> {
    try {
      const { data } = await api.get('/categories')
      categories.value = data.data ?? data
    } catch (err: unknown) {
      notifyApiError(err, 'Error al cargar categorías')
    }
  }

  async function loadAll(): Promise<void> {
    await Promise.all([loadProducts(), loadCategories()])
  }

  return { products, categories, loadProducts, loadCategories, loadAll }
})
