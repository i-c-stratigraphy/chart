<script setup lang="ts">
import { type chartNode, type scalingFactor, getColLabel } from "@/utils/util"

const props = defineProps<{
    node: chartNode,
    lang: string,
    scaling: scalingFactor,
    kind: 'default' | 'precambrian',
    meta?: chartMeta,
    label: "stratigraphic" | "timescale" | "both" 
}>()

const emit = defineEmits<{
    (e: 'view', node: string): void
}>()

</script>
<template>
    <div class="grid-wrapper">
        <div class="grid-7" v-if="props.kind == 'default'">
            <div class="header v-text">{{getColLabel('Eon',props.label)}}</div>
            <div class="header v-text">{{getColLabel('Era',props.label)}}</div>
            <div class="header v-text">{{getColLabel('Period',props.label)}}</div>
            <div class="header col-span-2">{{getColLabel('Epoch',props.label)}}</div>
            <div style="position:relative">
                <span class="header">{{getColLabel('Age',props.label)}}</span>
                <span class="gssp-text v-text">GSSP</span>
            </div>
            <div class="header center age-text">Numeric Age</div>
            <ChartGridCell :lang="props.lang" :node="props.node" :parent-rank="''" :scaling="props.scaling"
                @view="n => emit('view', n)" />
        </div>
        <template v-else>
            <div class="grid-5 precambrian-grid">
                <div class="header v-text">{{getColLabel('Super-Eon',props.label)}}</div>
                <div class="header v-text">{{getColLabel('Eon',props.label)}}</div>
                <div class="header">{{getColLabel('Era',props.label)}}</div>
                <div  style="position:relative">
                    <span class="header">{{getColLabel('Period',props.label)}}</span>
                    <span class="v-text gssp-text ">GSSP<br/> GSSA</span>
                </div>
                <div class="header center age-text">Numeric Age</div>
                <ChartGridPrecambrianCell :lang="props.lang" :node="props.node" :parent-rank="''"
                    :scaling="props.scaling" @view="x => emit('view', x)" />
            </div>
            <div class="chart-notes" v-if="props.meta">
                <p v-for="line in getScopedNote(props.meta, props.lang).value.split('\n')">
                    {{ line }}
                </p>
            </div>
        </template>
    </div>
</template>
<style scoped>
.grid-5 {
    margin-top: 4rem;
    --_thin-col: 2rem;
    --_mid-col: 6fr;
    display: grid;
    grid-template-columns:
        repeat(2, var(--_thin-col)) repeat(3, var(--_wide-col, 1fr));
    /* font-size: 0.6em; */
}

.grid-5 :deep(div:last-child>.num-age-beginning) {
    display: block;
    transform: translate(-50%, 50%);
    bottom: 0px;
}

.grid-7 {
    margin-top: 4rem;
    --_thin-col: 2rem;
    --_mid-col: 6fr;
    --_wide-col: calc(var(--_thin-col, 3rem) + var(--_mid-col));
    display: grid;
    grid-template-columns: var(--_thin-col) var(--_thin-col) var(--_thin-col) var(--_thin-col) 1fr 1fr 1fr;
    /* font-size: 0.6em; */
}

.grid-7 :deep(div:last-child>.num-age-beginning) {
    display: block;
    transform: translate(-50%, 50%);
    bottom: 0px;
}

.header {
    position: relative;
    margin-bottom: 0.5rem;
    text-wrap: nowrap;
    /* height:1.5rem; */
    transform: rotate(-45deg)
}
.age-text{
    transform: rotate(0);
}
div.header:not(.v-text) {
    padding-left: 5px;
}

.col-span-2 {
    grid-column: span 2;
}

.gssp-text {
    position: absolute;
    right: 0;
    bottom:0;
    margin-bottom: 10px;
    margin-right: -15px;
    transform: 
    rotate(-90deg) 
}

.center {
    text-align: center;
}
.chart-notes{
    text-align: left;
    font-size:0.8em;
    line-height: 1em;
}
</style>