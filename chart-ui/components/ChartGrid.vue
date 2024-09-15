<script setup lang="ts">
import { type chartNode, type scalingFactor } from "@/utils/util"


const props = defineProps<{
    node: chartNode,
    lang: string,
    scaling:scalingFactor
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
}>()

</script>
<template>
    <div class="grid-wrapper">
        <div class="grid-7">
            <div class="header v-text">Eon</div>
            <div class="header v-text">Era</div>
            <div class="header v-text">Period</div>
            <div class="header col-span-2">Epoch</div>
            <div class="header">Age
                <span class="gssp-text v-text">GSSP</span>
            </div>
            <div class="header">Numeric Age</div>
            <ChartGridCell :lang="props.lang" :node="props.node" :parent-rank="''" :scaling="props.scaling" @view="n=>emit('view',n)"/>
        </div>
    </div>
</template>
<style scoped>
.grid-wrapper{
    /* padding:1rem */
}
.grid-7 {
    max-width:25vw;
    margin-top: 4rem;
    --_thin-col: 3rem;
    --_mid-col: 6fr;
    --_wide-col: calc(var(--_thin-col, 3rem) + var(--_mid-col));
    display: grid;
    /* grid-template-columns:
        repeat(3, var(--_thin-col)) var(--_thin-col) var(--_mid-col) repeat(2, var(--_wide-col)); */

        grid-template-columns: 3rem 3rem 3rem     3rem 1fr    1fr 1fr ;
    font-size: 0.6em;
}

.header {
    position: relative;
}

.col-span-2 {
    grid-column: span 2;
}

.v-text {
    /* position: absolute; */
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg)
        /*translateX(-100%);*/
}
.gssp-text{
    position:absolute;
    right:0;
    transform-origin: 0 0;
    transform: rotate(-90deg)
        translateY(150%);
}
</style>