<script setup lang="ts">
import { computed } from "vue"
import n3 from "n3"
import { getLangVariant, sortedNode,getTimeMarker, type scalingFactor, type chartNode } from "@/utils/util"
import { useLabelContext } from "@/utils/label"

const props = defineProps<{
    node: chartNode,
    lang: string,
    parentRank: string,
    scaling: scalingFactor
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
}>()

const { getLabel } = useLabelContext()

const ranking: { [key: string]: number } = {
    Age: 6,
    Epoch: 5,
    'Sub-Period': 4,
    Period: 3,
    Era: 2,
    Eon: 1,
}
const rankSplit = (props.node.rank + '').split("/")

const rank = rankSplit[rankSplit.length - 1] || "Age"
let colStart = ranking[rank]!
let epochDelta = 1
let useShortNames = false
if (rank === "Epoch" && props.parentRank != "Sub-Period") {
    colStart = 4
    epochDelta = 2
}
if (rank === "Epoch" && props.parentRank === "Sub-Period") {
    useShortNames = true
}

const handleClick = () => {
    emit("view", props.node.id)
}

const label = computed(() => {
    return getLabel(props.node.id)
})
</script>
<template>
<!--     
 -->
    <div :class="`cell rank-${rank}`" @click="handleClick" :style="`
        --_row-span:${props.node.counts.indirectNarrowers??1};
        --_col-start:${colStart};
        --_col-end:${!props.node.narrower ? 7 : colStart + epochDelta};
        --_bg-color:${props.node.color};
        --_row-span:${props.node.counts.indirectNarrowers};
        --_fg-color:${contrastColor(hexToRgb(props.node.color))};
        --_width: ${rank == 'Sub-Period' || colStart < 4 ? `3rem` : ``};
        --_height:${!props.node.narrower ? getScaledHeight(props.scaling, props.node.hasEnd, props.node.hasBeginning,props.node.rawPercent, props.node.irregularHeight):''};
    `" :title="label">
        <p :class="`label ${rank == 'Sub-Period' || colStart < 4 ? `v-text` : ``}`">{{ label }}</p>
        <template v-if="!props.node.narrower">
            <div class="gss-icon" v-if="props.node.ratifiedGSSA">
                <GSSAClock />
            </div>
            <div class="gss-icon" v-if="props.node.ratifiedGSSP">
                <GSSPGoldenSpike />
            </div>
        </template>
    </div>
    <ChartGridCell v-for="narrower in sortedNode(props.node)" :key="narrower.id" :lang="props.lang" :node="narrower"
        :parent-rank="rank" :scaling="props.scaling" @view="(n) => emit('view', n)" />
    <div v-if="!props.node.narrower" class="text-cell" :style="`
    --_col-start:7;
    --_col-end:8;
    --_bg-color:;
    `">
         <span class="num-age" v-html="getTimeMarker(node.hasBeginning,node.hasEnd)"></span>
         <span class="num-age-beginning" v-html="getTimeMarker(node.hasEnd,node.hasBeginning)"></span>
    </div>
</template>
<style scoped>
.label{
    /* margin-top:0.25rem; */
    font-size: 0.8rem;
    line-height: 1;
}
@media print {
    .label {
        font-size: 0.7rem;
        padding-top: 0.1rem;
    }
}
.rank-Sub-Period{
    /* outline-color: magenta !important; */
    margin-left: -0.5rem !important;
}
.cell {
    container-type: inline-size;
    container-name: cell;
    outline: black solid 1px;
    position: relative;
    background-color: var(--_bg-color);
    color: var(--_fg-color, black);
    grid-column-start: var(--_col-start);
    grid-column-end: var(--_col-end);
    grid-row: span var(--_row-span);
    height: 100%;
    height: var(--_height, 2%);
    max-width: var(--_width);
    /* padding: 0.25rem; */
    overflow: hidden;
    cursor: pointer;
    min-height: 1rem;
     /* min-height: 1.25rem; */
     font-size: 10px;
}
@container (max-height: 2rem) {
    p.label {
        margin:0;
        font-size: 10px;
        line-height: 1;
    }
}
p {
    padding: 0;
    margin: 0;
    word-break:normal;
   
}

.text-cell {
    grid-column-start: 7;
    grid-column-end: 8;
    position: relative;
    align-items: baseline;
    justify-content: baseline;
    text-align: center;
    height: 100%;
    font-size: 0.8rem;
}

.v-text {
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-100%);
    /* height:100px; 
    width:500px; */
    text-align: end;
}

.gss-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    margin-bottom: -5px;
}

.num-age {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    top: 0px;
    width: max-content;
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