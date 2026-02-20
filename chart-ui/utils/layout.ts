import type { AnyPointer } from 'clownface'
import n3 from 'n3'
import { type chartNode } from './util'

const { namedNode } = n3.DataFactory

const NS = {
  skos: 'http://www.w3.org/2004/02/skos/core#',
  time: 'http://www.w3.org/2006/time#',
  gts: 'http://resource.geosciml.org/ontology/timescale/gts#',
  ischart: 'http://resource.geosciml.org/classifier/ics/ischart/',
  sdo: 'https://schema.org/',
  sh: 'http://www.w3.org/ns/shacl#',
  rank: 'http://resource.geosciml.org/ontology/timescale/rank/',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  prov: 'http://www.w3.org/ns/prov#',
}

export function useLayoutEngine(cf: AnyPointer) {
  function getLiteralTerm(node: AnyPointer, predicate: string) {
    const term = node.out(namedNode(predicate)).term
    if (term?.termType === 'Literal') {
      return term
    }
    return undefined
  }

  function parseLiteralNumber(literalValue: string | undefined): number | undefined {
    if (literalValue === undefined) {
      return undefined
    }
    const parsed = parseFloat(literalValue)
    if (Number.isNaN(parsed)) {
      return undefined
    }
    return parsed
  }

  function getLiteral(node: AnyPointer, predicate: string): string | undefined {
    return getLiteralTerm(node, predicate)?.value
  }

  function getNumeric(node: AnyPointer, predicate: string): number | undefined {
    const val = getLiteral(node, predicate)
    return parseLiteralNumber(val)
  }

  function getTimeMarker(node: AnyPointer, predicate: string) {
    const marker = node.out(namedNode(predicate))
    const inMYATerm = getLiteralTerm(marker, NS.ischart + 'inMYA')
    const marginOfErrorTerm = getLiteralTerm(marker, NS.sdo + 'marginOfError')
    const inMYA = parseLiteralNumber(inMYATerm?.value) ?? 0
    const marginOfError = parseLiteralNumber(marginOfErrorTerm?.value)
    const note = getLiteral(marker, NS.skos + 'note') ?? ''
    return {
      inMYA,
      inMYALexical: inMYATerm?.value,
      marginOfError,
      marginOfErrorLexical: marginOfErrorTerm?.value,
      note,
    }
  }

  function buildNode(iri: string, maxDepth = Number.POSITIVE_INFINITY): chartNode {
    const node = cf.node(namedNode(iri))

    const children = maxDepth > 0
      ? node.out(namedNode(NS.skos + 'narrower'))
          .map(child => buildNode(child.term!.value, maxDepth - 1))
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      : []

    const directNarrowers = children.length
    const indirectNarrowers = children.reduce((acc, child) => acc + (child.counts?.indirectNarrowers || 0) + 1, 0)

    return {
      id: iri,
      type: 'skos:Concept', // Default
      rank: node.out(namedNode(NS.gts + 'rank')).term?.value || '',
      ratifiedGSSP: getLiteral(node, NS.gts + 'ratifiedGSSP') === 'true',
      ratifiedGSSA: getLiteral(node, NS.gts + 'ratifiedGSSA') === 'true',
      isDefinedBy: getLiteral(node, NS.rdfs + 'isDefinedBy') || '',
      definition: getLiteral(node, NS.skos + 'definition') || '',
      inScheme: getLiteral(node, NS.skos + 'inScheme') || '',
      notation: getLiteral(node, NS.skos + 'notation') || '',
      prefLabel: { language: 'en', value: '' }, // Placeholder, will be handled by LabelProvider
      hasBeginning: getTimeMarker(node, NS.time + 'hasBeginning'),
      hasEnd: getTimeMarker(node, NS.time + 'hasEnd'),
      broader: node.out(namedNode(NS.skos + 'broader')).terms.map(t => t.value),
      narrower: children.length > 0 ? children : undefined,
      order: getNumeric(node, NS.sh + 'order') || 0,
      wasDerivedFrom: getLiteral(node, NS.prov + 'wasDerivedFrom') || '',
      color: getLiteral(node, NS.sdo + 'color') || '#FFFFFF',
      counts: {
        directNarrowers,
        indirectNarrowers,
      },
      height: 0,
      remainderHeigt: 0,
      irregularHeight: 0,
      rawPercent: 0,
    }
  }

  function getLeafNodes(node: chartNode, leaves: chartNode[] = []) {
    if (node.narrower && node.narrower.length > 0) {
      node.narrower.forEach(n => getLeafNodes(n, leaves))
    } else {
      leaves.push(node)
    }
    return leaves
  }

  function calculateHeights(root: chartNode) {
    const EQPROVISION = 2
    const leaves = getLeafNodes(root)
    const totalTime = leaves.reduce((acc, leaf) => {
      const h = leaf.hasBeginning.inMYA - leaf.hasEnd.inMYA
      leaf.height = h
      return acc + h
    }, 0)

    const reservedPc = leaves.length * EQPROVISION
    const remainderPc = 100 - reservedPc

    leaves.forEach(leaf => {
      leaf.remainderHeigt = (leaf.height / totalTime) * remainderPc
      leaf.irregularHeight = EQPROVISION + leaf.remainderHeigt
      leaf.rawPercent = 100 / leaves.length
    })

    // Back-propagate heights to parent nodes
    function updateParentHeights(node: chartNode): number {
      if (node.narrower && node.narrower.length > 0) {
        node.irregularHeight = node.narrower.reduce((acc, child) => acc + updateParentHeights(child), 0)
        node.rawPercent = node.narrower.reduce((acc, child) => acc + child.rawPercent, 0)
      }
      return node.irregularHeight
    }
    updateParentHeights(root)
  }

  function splitChart(rootIri: string, includePeriods: string[]): chartNode {
    const root = buildNode(rootIri)
    if (root.narrower) {
      root.narrower = root.narrower.filter(era => {
        if (era.narrower) {
          era.narrower = era.narrower.filter(period => includePeriods.includes(period.id))
          return era.narrower.length > 0
        }
        return false
      })
    }
    calculateHeights(root)
    return root
  }

  function getSegments() {
    const phanerozoic = NS.ischart + 'Phanerozoic'
    const precambrian = NS.ischart + 'Precambrian'

    const s1 = splitChart(phanerozoic, [
      NS.ischart + 'Cretaceous',
      NS.ischart + 'Paleogene',
      NS.ischart + 'Neogene',
      NS.ischart + 'Quaternary',
    ])
    const s2 = splitChart(phanerozoic, [
      NS.ischart + 'Jurassic',
      NS.ischart + 'Triassic',
      NS.ischart + 'Permian',
      NS.ischart + 'Carboniferous',
    ])
    const s3 = splitChart(phanerozoic, [
      NS.ischart + 'Devonian',
      NS.ischart + 'Silurian',
      NS.ischart + 'Ordovician',
      NS.ischart + 'Cambrian',
    ])
    
    const s4 = buildNode(precambrian)
    calculateHeights(s4)

    return [s1, s2, s3, s4]
  }

  return {
    buildNode,
    getSegments,
    calculateHeights
  }
}
