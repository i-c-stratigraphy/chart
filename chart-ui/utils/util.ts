
export type chartNode = {
    narrower?: chartNode[]
    rank: string
    counts: {
        directNarrowers: number
        indirectNarrowers: number
    }
    [key: string]: any
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
    id:string 
    prefLabel: LangLabel
    altLabel: LangLabel[] | null
}

type HierachyRecord ={
    narrower: HierachyItem[] | null
    broader: HierachyItem | null
}

export type Hierachy = Record<string,HierachyRecord>




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

export function getLangVarientFromHierachy(node: HierachyItem, lang:string):string{
    if (node.altLabel){
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
export function getScaledHeight(scale: scalingFactor, beggining: number, end: number) {
    switch (scale.value) {
        case "none":
            return "2rem"
        case "log":
            return `calc( 1rem + ${(Math.log(end - beggining) < 0 ? 0 : Math.log(end - beggining)) * SCALE_OFFSET}px)`
        case "print":
            const print_offset = 5
            return `calc( 1.1rem + ${(Math.log(end - beggining) < 0 ? 0 : Math.log(end - beggining)) * print_offset}px)`
        case "linear":
            return `calc( 1rem + ${(end - beggining) * SCALE_OFFSET}px)`
        default:
            return null
    }
}

const intScaleOptions: Record<string,string> = {
    "none": "Equal",
    "log": "Logarithmic",
    "linear": "Linear",
    "print": "Print",
}
export const scaleOptions = [
    "none",
    "log",
    "linear",
]
export function getScaleOptionLabel(v: string): string {
    try {
        return intScaleOptions[v]
    }catch{
        return "none"
    }
}
export function getScaleObj(v: string): scalingFactor {
return {
    name:getScaleOptionLabel(v),
    value:v,
}
}

export function getCachedInfo(target:string){
    const val = window.localStorage.getItem("target")
    if (val == ""|| val === null){
        return {}
    }
    return JSON.parse(val)

}