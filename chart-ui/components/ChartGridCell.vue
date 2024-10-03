<script setup lang="ts">
import {getRecurseChildCount, getLangVariant ,sortedNode, type scalingFactor, type chartNode} from "@/utils/util"
const props = defineProps<{
    node: chartNode,
    lang: string,
    parentRank: string,
    scaling:scalingFactor
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
}>()
const node = props.node
const ranking: { [key: string]: number } = {
    Age: 6,
    Epoch: 5,
    'Sub-Period': 4,
    Period: 3,
    Era: 2,
    Eon: 1,
}
const rankSplit = (node.rank+'').split("/")

const rank = rankSplit[rankSplit.length-1]||"Age"
let colStart = ranking[rank]!
let epochDelta = 1
if (rank === "Epoch" && props.parentRank != "Sub-Period") {
    colStart = 4
    epochDelta = 2
}

const handleClick = ()=>{
    emit("view",node.id)
}
</script>
<template>
    <div class=" cell" 
   @click="handleClick"
    :style="`
    --_col-start:${colStart};
    --_col-end:${!node.narrower ? 7 :colStart + epochDelta };
    --_bg-color:${node.color};
    --_row-span:${getRecurseChildCount(1,node)};
    --_fg-color:${contrastColor(hexToRgb(node.color)!)};
    --_height:${!node.narrower ? getScaledHeight(props.scaling,node.hasEnd.inMYA['@value'],node.hasBeginning?.inMYA['@value']):''};
    --_width: ${rank == 'Sub-Period' || colStart <4?`3rem`:``}
    `"
    >
        <p :class="`label ${rank == 'Sub-Period' || colStart <4?`v-text`:``}`">{{ getLangVariant(node, props.lang) }}</p>
        <template v-if="!node.narrower">
            <div class="gss-icon" v-if="node.ratifiedGSSA">
                <GSSAClock />
            </div>
            <div class="gss-icon" v-if="node.ratifiedGSSP">
                <GSSPGoldenSpike />
            </div>
        </template>
    </div>
    <ChartGridCell v-for="narrower in sortedNode(node)"  :key="narrower.id"  :lang="props.lang" :node="narrower" :parent-rank="rank" :scaling="props.scaling" @view="(n)=>emit('view', n)"/>
    <div v-if="!node.narrower" class="text-cell"
    :style="`
    --_col-start:7;
    --_col-end:8;
    --_bg-color:;
    `"
    >
    <span class="num-age">
        {{ node.hasBeginning?.["skos:note"] ===
            "uncertain" ||
            node.hasEnd?.["skos:note"]
            === "uncertain" ? "~" : '' }}
        {{ node.hasEnd.inMYA["@value"] == 0 ?
            'Present' :
            `${node.hasEnd.inMYA["@value"]}` }}
        {{ node.hasEnd.marginOfError ? `&pm;
        ${node.hasEnd.marginOfError["@value"]}` : ''
        }}
        </span>
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
    height: var(--_height, 100%);
    max-width: var(--_width);
    padding:0.25rem;
    overflow: hidden;
}
p{
    padding:0;
    margin:0;
}
.text-cell{
    grid-column-start: 7;
    grid-column-end:8;
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
    bottom:0px;
    width:max-content;
}
</style>