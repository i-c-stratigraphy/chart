<script setup lang="ts">
import { computed } from "vue"
import n3 from "n3"
import { getLangVariant ,sortedNode, getScaledHeight, getTimeMarker,type scalingFactor} from "@/utils/util"
import chart from "@/public/chart.json"
import { useLabelContext } from "@/utils/label"

const { namedNode } = n3.DataFactory

const props = defineProps<{
    node: chartNode,
    lang: string,
    scaling:scalingFactor
    parentRank: string
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
}>()
const node = props.node
const ranking: { [key: string]: number } = {
    Period: 4,
    Era: 3,
    Eon: 2,
    'Super-Eon':1
}
const rankSplit = (node.rank+'').split("/")
const rank = rankSplit[rankSplit.length-1]||"Age"
let colStart = ranking[rank]!
let epochDelta = 1
const { getLabel } = useLabelContext()

const handleClick = ()=>{
    emit("view",node.id)
}

const iri = computed(() => {
    const [prefix, localName] = props.node.id.split(":");
    const namespace = chart["@context"][prefix as keyof typeof chart["@context"]];
    const iri = `${namespace}${localName}`;
    return namedNode(iri)
})

const label = computed(() => {
    return getLabel(iri.value)
})
</script>
<template>
    <div class=" cell" 
   @click="handleClick"
    :style="`
    --_col-start:${colStart};
    --_col-end:${!node.narrower ? 5 :colStart + epochDelta };
    --_bg-color:${node.color};
    --_row-span:${node.counts.indirectNarrowers};
    --_fg-color:${contrastColor(hexToRgb(node.color)!)};
    --_height:${!node.narrower ? getScaledHeight(props.scaling,node.hasEnd,node.hasBeginning,props.node.rawPercent, props.node.irregularHeight,true):''};
    `" :title="label"
    >
        <p :class="`label ${(rank === 'Eon' && !node.narrower )|| colStart >=3?``:`v-text`}`">{{ label }}</p>
        <template v-if="!node.narrower">
            <div class="gss-icon" v-if="node.ratifiedGSSA">
                <GSSAClock />
            </div>
            <div class="gss-icon" v-if="node.ratifiedGSSP">
                <GSSPGoldenSpike />
            </div>
        </template>
    </div>
    <ChartGridPrecambrianCell v-for="narrower in sortedNode(node)"  :key="narrower.id"  :lang="props.lang" :node="narrower" :parent-rank="rank" :scaling="props.scaling" @view="(n)=>emit('view', n)"/>
    <div v-if="!node.narrower" class="text-cell"
    :style="`
    --_col-start:5;
    --_col-end:6;
    --_bg-color:;
    `"
    >
    <span class="num-age" v-html="getTimeMarker(node.hasBeginning,node.hasEnd)"></span>
    <span class="num-age-beginning" v-html="getTimeMarker(node.hasEnd,node.hasBeginning)"></span>

    </div>
</template>
<style scoped>
.label{
    /* margin-top:0.25rem; */
    font-size: 13px;
    line-height: 13px;
}
.cell{
    outline:black solid 1px;
    position:relative;
    background-color: var(--_bg-color);
    color: var(--_fg-color,black);
    grid-column-start: var(--_col-start);
    grid-column-end:var(--_col-end);
    grid-row: span var(--_row-span);
    height:100%;
    height: var(--_height, 100%);
    overflow:hidden;
    cursor:pointer;
    min-height: 1rem;
    /* 1.25rem; */
}
p {
    padding: 0;
    margin: 0;
    word-break:normal;
}

.text-cell{
    grid-column-start: 5;
    grid-column-end:6;
    position:relative;
    align-items: baseline;
    justify-content: baseline;
    text-align: center;
    height:100%;
    font-size: 13px;
}
.v-text {
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-100%);
    /* outline:lime 10px solid; */
    /* height:100px; 
    width:500px; */
    text-align: end;
}
.gss-icon{
    position:absolute;
    bottom:0;
    right:0;
    margin-bottom: -5px;
}
.num-age{
    position:absolute;
    left:50%;
    transform: translate(-50%, -50%);;
    top:0px;
    width:max-content;
}
.num-age-beginning{
    position: absolute;
    display:none;
    left: 50%;
    transform: translate(-50%,50%);
    bottom: 10px;
    width: max-content;
}
</style>