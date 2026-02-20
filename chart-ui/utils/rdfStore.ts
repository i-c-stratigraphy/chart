import { ref, shallowRef } from 'vue'
import n3 from 'n3'
import clownface from 'clownface'
import $rdf from 'rdf-ext'
import type { AnyPointer } from 'clownface'

export function useRDFStore() {
  const store = shallowRef<n3.Store>(new n3.Store())
  const cf = shallowRef<AnyPointer | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function loadStore() {
    loading.value = true
    error.value = null
    const parser = new n3.Parser()
    const urls = [
      'chart.ttl',
      'prefLabels.ttl',
      'definitions.ttl'
    ]

    try {
      const quads: n3.Quad[] = []
      await Promise.all(urls.map(async (url) => {
        const response = await fetch(`${url}?cachebreaker=${Math.random()}`)
        if (!response.ok) throw new Error(`Failed to fetch ${url}`)
        const text = await response.text()
        quads.push(...parser.parse(text))
      }))

      const newStore = new n3.Store(quads)
      store.value = newStore
      cf.value = clownface({ dataset: newStore })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error loading RDF store:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    store,
    cf,
    loading,
    error,
    loadStore
  }
}
