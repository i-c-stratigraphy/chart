<script setup lang="ts">
import { type chartNode } from "@/utils/util"


const props = defineProps<{
    node: chartNode,
    lang: string,
}>()

</script>
<template>
    <div>
        <div class="grid-7">
            <div class="header v-text">Eon</div>
            <div class="header v-text">Era</div>
            <div class="header v-text">Period</div>
            <div class="header col-span-2">Epoch</div>
            <div class="header">Age
                <span class="gssp-text v-text">GSSP</span>
            </div>
            <div class="header">Numeric Age</div>
            <ChartGridCell :lang="props.lang" :node="props.node" :parent-rank="''" />
        </div>
    </div>
</template>
<style scoped>
.grid-7 {
    margin-top: 4rem;
    --_thin-col: 2fr;
    --_mid-col: 6fr;
    --_wide-col: calc(var(--_thin-col) + var(--_mid-col));
    display: grid;
    grid-template-columns:
        repeat(3, var(--_thin-col)) var(--_thin-col) var(--_mid-col) repeat(2, var(--_wide-col));
    font-size: 0.8em;
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
.eg {
    min-height: 6rem;
    outline: black solid 1px
}
</style>