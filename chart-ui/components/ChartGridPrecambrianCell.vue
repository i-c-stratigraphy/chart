<script setup lang="ts">
import {getRecurseChildCount, getLangVariant ,sortedNode} from "@/utils/util"
const props = defineProps<{
    node: chartNode,
    lang: string,
    parentRank: string
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
// console.log("ranks=", rankSplit[rankSplit.length-1] )
let colStart = ranking[rank]!
let epochDelta = 1



</script>
<template>
    <div class=" cell" 
   
    :style="`
    --_col-start:${colStart};
    --_col-end:${!node.narrower ? 5 :colStart + epochDelta };
    --_bg-color:${node.color};
    --_row-span:${getRecurseChildCount(1,node)};
    --_fg-color:${contrastColor(hexToRgb(node.color)!)};
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
    <ChartGridPrecambrianCell v-for="narrower in sortedNode(node)"  :key="narrower.id"  :lang="props.lang" :node="narrower" :parent-rank="rank"/>
    <div v-if="!node.narrower" class="text-cell"
    :style="`
    --_col-start:5;
    --_col-end:6;
    --_bg-color:;
    `"
    
    >
        {{ node.hasBeginning?.["skos:note"] ===
            "uncertain" ||
            node.hasEnd?.["skos:note"]
            === "uncertain" ? "~" : '' }}
        {{ node.hasEnd.inMYA["@value"] == 0 ?
            'Present' :
            `${node.hasEnd.inMYA["@value"]}` }}
        {{ node.hasEnd.marginOfError ? `&mnplus;
        ${node.hasEnd.marginOfError["@value"]}` : ''
        }}
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
}
.text-cell{
    grid-column-start: 5;
    grid-column-end:6;
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
</style>