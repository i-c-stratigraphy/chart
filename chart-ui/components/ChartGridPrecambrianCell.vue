<script setup lang="ts">
import { getLangVariant ,sortedNode, getScaledHeight, getTimeMarker,type scalingFactor} from "@/utils/util"
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



const handleClick = ()=>{
    emit("view",node.id)
}
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
    --_height:${!node.narrower ? getScaledHeight(props.scaling,node.hasEnd,node.hasBeginning):''};
    `"
    >
        <p :class="`label ${(rank === 'Eon' && !node.narrower )|| colStart >=3?``:`v-text`}`">{{ getLangVariant(node, props.lang) }}</p>
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
    </div>
</template>
<style scoped>
.cell{
    outline:black solid 1px;
    position:relative;
    background-color: var(--_bg-color);
    color: var(--_fg-color,black);
    grid-column-start: var(--_col-start);
    grid-column-end:var(--_col-end);
    grid-row: span var(--_row-span);
    height:100%;
    height: var(--_height);
    cursor:pointer;
}
.text-cell{
    grid-column-start: 5;
    grid-column-end:6;
    position:relative;
    align-items: baseline;
    justify-content: baseline;
    /* grid-row: span var(--_row-span); */
    text-align: center;
    height:100%;
}
.v-text {
    /* position: absolute; */
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-100%);
}
.gss-icon{
    position:absolute;
    bottom:0;
    right:0;
}
.num-age{
    position:absolute;
    left:50%;
    transform: translateX(-50%);
    top:0px;
    width:max-content;
}
</style>