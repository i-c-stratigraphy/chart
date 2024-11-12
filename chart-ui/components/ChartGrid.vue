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
            <div class="header center">Numeric Age</div>
            <ChartGridCell :lang="props.lang" :node="props.node" :parent-rank="''" :scaling="props.scaling" @view="n=>emit('view',n)"/>
        </div>
    </div>
</template>
<style scoped>
.grid-7 {
    margin-top: 4rem;
    --_thin-col: 3rem;
    --_mid-col: 6fr;
    --_wide-col: calc(var(--_thin-col, 3rem) + var(--_mid-col));
    display: grid;
    grid-template-columns: 3rem 3rem 3rem     3rem 1fr    1fr 1fr ;
    font-size: 0.6em;
}
.grid-7 :deep(div:last-child>.num-age-beginning){
    display:block;
    transform: translate(-50%,50%);
    bottom: 0px;
}

.header {
    position: relative;
    margin-bottom:0.25rem;
}
div.header:not(.v-text){
    padding-left:5px;
}
.col-span-2 {
    grid-column: span 2;
}

.v-text {
    display: inline-block;
    transform-origin: 5px 5px;
    transform: rotate(-90deg)
}
.gssp-text{
    position:absolute;
    right:0;
    transform: rotate(-90deg)
        translateY(150%);
}
.center{
    text-align: center;
}
</style>