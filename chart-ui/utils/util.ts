
export type chartNode = {
    narrower?: chartNode[]
    [key: string]: any
}
export type root = {
    hasTopConcept?: chartNode[]
    [key: string]: any
}
export function onlyUnique(value: string, index: number, array: string[]) {
    return array.indexOf(value) === index;
}
export function sortedNode(node: chartNode) {
    return node.narrower?.sort((a, b) =>
        parseInt(a.order['@value']) == parseInt(b.order['@value']) ? 0 :
            parseInt(a.order['@value']) > parseInt(b.order['@value']) ? 1 : -1
    )
}
export function getLangVariant(node: chartNode, lang:string) {
    if (Array.isArray(node.altLabel)) {
        const alt = node.altLabel.filter(x => x["@language"] == lang)
        if (alt.length == 1) {
            console.log(alt[0]["@value"])
            return alt[0]["@value"]
        }
    }
    return node.prefLabel["@value"]

}