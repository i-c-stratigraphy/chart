import { ref, shallowRef } from 'vue'
import n3 from 'n3'
import clownface from 'clownface'
import type { AnyPointer } from 'clownface'
import chartTtl from '../../source/multilang/chart-nolang.ttl?raw'
import prefLabelsTtl from '../../source/multilang/prefLabels.ttl?raw'
import definitionsTtl from '../../source/multilang/definitions.ttl?raw'

export function useRDFStore() {
  const store = shallowRef<n3.Store>(new n3.Store())
  const cf = shallowRef<AnyPointer | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function loadStore() {
    loading.value = true
    error.value = null
    const parser = new n3.Parser()

    try {
      const quads: n3.Quad[] = [
        ...parser.parse(chartTtl),
        ...parser.parse(prefLabelsTtl),
        ...parser.parse(definitionsTtl),
      ]

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
