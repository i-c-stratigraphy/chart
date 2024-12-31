
export type chartNode = {
    id: string
    type: string
    rank: string
    ratifiedGSSP?: boolean
    ratifiedGSSA?: boolean
    isDefinedBy: string
    altLabel?: chartLanguage[]
    broader?: string[]
    definition: string
    inScheme: string
    notation: string
    prefLabel: chartLanguage
    hasBeginning: timeMarker
    hasEnd: timeMarker
    narrower?: chartNode[]
    order: number
    wasDerivedFrom: string
    color: string
    counts: {
        directNarrowers: number
        indirectNarrowers: number
    }
    height: number
    remainderHeigt: number
    irregularHeight: number
    rawPercent: number
    [key: string]: any
}
type chartLanguage = {
    language: string
    value: string
}
type timeMarker = {
    inMYA: number | {
        type: string
        value: number
    }
    marginOfError?: number | {
        type: string
        value: number
    }
    note: string
}

export interface sdoname {
    name: string 
    alternateName: chartLanguage[]
}
export type chartMeta = {
    id: string
    type: string
    conformsTo: string
    created: string
    creator: {
        id: string
        type: string
        name: string
        url: string
        alternateName: chartLanguage[]
    }
    modified: string
    publisher: string
    versionURI: string
    versionInfo: string
    altLabel: chartLanguage[]
    definition: chartLanguage
    historyNote: string
    prefLabel: chartLanguage
    scopeNote: chartLanguage[]
    skosVersionInfo: string
    wasDerivedFrom: string
    citation: {
        type: string
        value: string
    }
    copyrightHolder: {
        id: string
    }
    copyrightNotice: chartLanguage
    license: {
        id: string
    }

}

export type root = {
    hasTopConcept?: chartNode[]
    [key: string]: any
}
export type scalingFactor = {
    name: string
    value: string
}


type LangLabel = {
    value: string
    language: string
}
type HierachyItem = {
    id: string
    prefLabel: LangLabel
    altLabel: LangLabel[] | null
}

type HierachyRecord = {
    narrower: HierachyItem[] | null
    broader: HierachyItem | null
}

export type Hierachy = Record<string, HierachyRecord>

export function getTimeMarker(beginning: timeMarker, end: timeMarker): string {
    // end.inMYA
    let certainty = ""
    if (beginning.note === "uncertain" || end.note === "uncertain") {
        certainty += "~"
    }
    let isPresent: boolean = false
    let strTime: string = ""
    let MarginOfError: string = ""
    if (typeof end.inMYA === 'number') {
        isPresent = end?.inMYA === 0
        strTime = end?.inMYA.toString()

    } else {
        isPresent = end?.inMYA.value == 0
        strTime = end?.inMYA.value.toString()
        MarginOfError
    }
    if (end.marginOfError && typeof end.marginOfError == "number") {
        MarginOfError = end.marginOfError.toString()
    } else if (end.marginOfError && !(typeof end.marginOfError == "number")) {
        MarginOfError = end.marginOfError.value.toString()
    }
    if (isPresent) {
        return 'Present'
    }

    return `${certainty}${strTime} ${MarginOfError != '' ? '&plusmn; ' + MarginOfError : ''}`
}


export function onlyUnique(value: string, index: number, array: string[]) {
    return array.indexOf(value) === index;
}
export function sortedNode(node: chartNode) {
    return node.narrower?.toSorted((a, b) => a.order - b.order)
}
export function getLangVariant(node: chartNode, lang: string) {
    if (Array.isArray(node.altLabel)) {
        const alt = node.altLabel.filter(x => x.language == lang)
        if (alt.length == 1) {
            return alt[0].value
        }
    }
    return node.prefLabel.value
}
export function getTitleLangVariant(meta: chartMeta, lang: string) {
    if (Array.isArray(meta.altLabel)) {
        const alt = meta.altLabel.filter(x => x.language == lang)
        if (alt.length == 1) {
            console.log(alt[0].value)
            return alt[0].value
        }
    }
    console.log(meta.prefLabel.value)
    return meta.prefLabel.value
}
export function getNameLangVariant<t extends sdoname>(meta: t, lang: string) {
    if (Array.isArray(meta.alternateName)) {
        const alt = meta.alternateName.filter(x => x.language == lang)
        if (alt.length == 1) {
            console.log(alt[0].value)
            return alt[0].value
        }
    }
    console.log(meta.name)
    return meta.name
}

export function getLangVarientFromHierachy(node: HierachyItem, lang: string): string {
    if (node.altLabel) {
        const alt = node.altLabel.filter(x => x.language === lang)
        if (alt.length == 1) {
            return alt[0].value
        }
    }
    return node.prefLabel.value
}

let lookup: Record<string, chartNode> | null = null

export function getLangVariantById(nodeId: string, lang: string) {
    if (lookup == null) {
        lookup = JSON.parse(localStorage.getItem("lookup") || "{}")
    }
    if (lookup) {
        const node = lookup[nodeId]
        if (Array.isArray(node.altLabel)) {
            const alt = node.altLabel.filter(x => x.language == lang)
            if (alt.length == 1) {
                return alt[0].value
            }
        }
        return node.prefLabel.value
    }
    return ""
}

const SCALE_OFFSET = 10
function getTimeMarkerValue(t: timeMarker): number {
    if (typeof t.inMYA == "number") {
        return t.inMYA
    } else {
        return t.inMYA.value
    }
}
export function getScaledHeight(scale: scalingFactor, beggining: timeMarker, end: timeMarker, rawPercent?: number, irregularHeight?: number, precambrian = false) {
    const COLHEIGHT = 1600 //1200
    const endVal = getTimeMarkerValue(end)
    const beginVal = getTimeMarkerValue(beggining)
    switch (scale.value) {
        case "irregular":
            let ih = ((irregularHeight ?? 10) / 100) * COLHEIGHT
            if (precambrian) {
                ih = ih / 2
            }
            return `${ih}px`
        case "equal-rows":
            return "2rem"
        case "equal":
            if (!rawPercent) {
                return ''
            }
            let eqh = (rawPercent / 100) * COLHEIGHT
            if (precambrian) {
                eqh = eqh / 2
            }
            return `${eqh}px`
        case "log":
            return `calc( 1rem + ${(Math.log(endVal - beginVal) < 0 ? 0 : Math.log(endVal - beginVal)) * SCALE_OFFSET}px)`
        case "print":
            let pp = (((irregularHeight ?? 10) / 100) * (COLHEIGHT)/2.1)
            if (precambrian) {
                pp = pp / 2
            }
            return `${pp}px`
            const print_offset = 5
            return `calc( 1.1rem + ${(Math.log(endVal - beginVal) < 0 ? 0 : Math.log(endVal - beginVal)) * print_offset}px)`
        case "linear":
            return `calc( 1rem + ${(endVal - beginVal) * SCALE_OFFSET}px)`
        default:
            return null
    }
}

const intScaleOptions: Record<string, string> = {
    "irregular": "Irregular",
    "equal": "Equal Columns",
    "equal-rows": "Equal Rows",
    "log": "Logarithmic",
    "linear": "Linear",
    "print": "Print",
}
const hiddenScales = ['print']
export const scaleOptions = Object.keys(intScaleOptions).filter(x => !hiddenScales.includes(x))

export function getScaleOptionLabel(v: string): string {
    try {
        return intScaleOptions[v]
    } catch {
        return "equal-rows"
    }
}
export function getScaleObj(v: string): scalingFactor {
    return {
        name: getScaleOptionLabel(v),
        value: v,
    }
}

export function getCachedInfo(target: string) {
    const val = window.localStorage.getItem("target")
    if (val == "" || val === null) {
        return {}
    }
    return JSON.parse(val)

}

export function getScopedNote(meta: chartMeta, lang: string) {
    const scopeNote = meta.scopeNote.filter(x => x.language === lang)
    if (scopeNote.length != 1) {
        return meta.scopeNote.filter(x => x.language === "en")[0]
    }
    return scopeNote[0]
}

const colNames = {
    'Super-Eon': {
        stratigraphic: "Super Eonothem",
        timescale: "Super Eon",
    },
    Eon: {
        stratigraphic: "Eonothem",
        timescale: "Eon",
    },
    Era: {
        stratigraphic: "Erathem",
        timescale: "Era",
    },
    Period: {
        stratigraphic: "System",
        timescale: "Period",
    },
    Epoch: {
        stratigraphic: "Series",
        timescale: "Epoch",
    },
    Age: {
        stratigraphic: "Stage",
        timescale: "Age",
    },
}
export function getColLabel(col: keyof typeof colNames,mode: "stratigraphic" | "timescale" | "both"):string {
    switch (mode) {
        case "stratigraphic":
            return colNames[col].stratigraphic
        case "timescale":
            return colNames[col].timescale
        case "both":
            return colNames[col].stratigraphic+" / "+colNames[col].timescale

    }
}