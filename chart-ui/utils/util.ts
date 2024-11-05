
export type chartNode = {
    id:string 
    type:string 
    rank: string 
    ratifiedGSSP?: boolean 
    ratifiedGSSA?: boolean
    isDefinedBy: string 
    altLabel?:chartLanguage[]
    broader?: string[]
    definition: string 
    inScheme: string
    notation: string 
    prefLabel: chartLanguage
    hasBeginning:timeMarker
    hasEnd:timeMarker
    narrower?: chartNode[]
    order:number
    wasDerivedFrom: string 
    color: string 
    counts: {
        directNarrowers: number
        indirectNarrowers: number
    }

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
    marginOfError?:number | {
        type: string 
        value: number 
    }
    note:string
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

export function getTimeMarker(beginning: timeMarker, end: timeMarker) :string {
    // end.inMYA
    let certainty = ""
    if(beginning.note === "uncertain" || end.note === "uncertain")  {
        certainty +="~"
    }
    let isPresent:boolean = false
    let strTime:string = ""
    let MarginOfError:string = ""
    if (typeof end.inMYA === 'number'){
        isPresent = end?.inMYA === 0 
        strTime = end?.inMYA.toString()
        
    }else{
        isPresent = end?.inMYA.value == 0
        strTime = end?.inMYA.value.toString()
        MarginOfError
    }
    if (end.marginOfError && typeof end.marginOfError == "number"){
        MarginOfError = end.marginOfError.toString()
    }else if (end.marginOfError&& !(typeof end.marginOfError == "number")){
        MarginOfError = end.marginOfError.value.toString()
    }
    if (isPresent){
        return 'Present'
    }

    return `${certainty}${strTime} ${MarginOfError!= '' ? '&plusmn; '+ MarginOfError:''}` 
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
function getTimeMarkerValue(t: timeMarker):number{
    if (typeof t.inMYA == "number"){
        return t.inMYA
    }else{
        return t.inMYA.value
    }
}
export function getScaledHeight(scale: scalingFactor, beggining: timeMarker, end: timeMarker) {
    const endVal = getTimeMarkerValue(end)
    const beginVal = getTimeMarkerValue(beggining)
    switch (scale.value) {
        case "none":
            return "2rem"
        case "log":
            return `calc( 1rem + ${(Math.log(endVal - beginVal) < 0 ? 0 : Math.log(endVal - beginVal)) * SCALE_OFFSET}px)`
        case "print":
            const print_offset = 5
            return `calc( 1.1rem + ${(Math.log(endVal - beginVal) < 0 ? 0 : Math.log(endVal - beginVal)) * print_offset}px)`
        case "linear":
            return `calc( 1rem + ${(endVal - beginVal) * SCALE_OFFSET}px)`
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