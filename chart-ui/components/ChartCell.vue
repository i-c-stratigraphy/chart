<script setup lang="ts">
import { sortedNode, type chartNode } from "@/utils/util"
import { contrastColor, hexToRgb } from "@/utils/color"
// import gsspIcon from "@/assets/gssp-golden-spike.svg";
import gsspIcon from "@/public/gssp-golden-spike.svg";
// import gssaIcon from "@/assets/gssa-clock.svg";
import gssaIcon from "@/public/gssa-clock.svg";

const props = defineProps<{
    node: chartNode,
    lang: string
}>()
const node = props.node
</script>
<template>
    <!-- <table v-for="node in sortedNode(props.node)"> -->
        <!--  -->
        <tr>
            <td :style="!node.narrower?`display:relative; height: clamp(1rem, ${(node.hasBeginning.inMYA['@value'] - node.hasEnd.inMYA['@value']) * 10}px, 10rem);
            line-height: clamp(1rem, ${(node.hasBeginning.inMYA['@value'] - node.hasEnd.inMYA['@value']) * 10}px, 10rem); background-color: ${node.color}`:`background-color: ${node.color}`"
                :data-height="parseInt(node.hasBeginning.inMYA['@value']) - parseInt(node.hasEnd.inMYA['@value'])"
                :data-hasGSSP="node.ratifiedGSSP" :data-color="node.color"
                :data-hasGSSA="node.ratifiedGSSA"
                :data-fg-color="contrastColor(hexToRgb(node.color)!)">
                {{ getLangVariant(node, props.lang) }}
                <template v-if="!node.narrower">
                    <div class="gss-icon" v-if="node.ratifiedGSSA"><img src="./gssp-golden-spike.svg" /></div>
                    <div class="gss-icon" v-if="node.ratifiedGSSP"><img src="./gssa-clock.svg" /></div>
                </template>
            </td>

            <td v-if="!node.narrower" class="age">
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
            </td>
            <td v-else>
                <table v-for="narrower in sortedNode(node)"  :key="narrower.id" >
                <ChartCell :lang="props.lang" :node="narrower" />
            </table>
            </td>
        </tr>
    <!-- </table> -->
    <!-- </td>
    <td v-else class="age">
        {{ childNode.hasBeginning?.["skos:note"] === "uncertain" ||
            childNode.hasEnd?.["skos:note"] ===
            "uncertain" ? "~" : '' }}
        {{ childNode.hasEnd.inMYA["@value"] == 0 ? 'Present' :
            `${childNode.hasEnd.inMYA["@value"]}` }}
        {{ childNode.hasEnd.marginOfError ? `&mnplus;
        ${childNode.hasEnd.marginOfError["@value"]}` : '' }}
    </td>
    </tr>
    </table> -->
</template>
<style>
table,
tr,
td {
    border: 1px black solid;
    outline: 1px black solid;
    border: none;
    border-collapse: collapse;
    align-items: start;
    margin: 0px;
    padding: 0px;

}

td:first-child {
    width: 200px;
}

td.age {
    width: 100px;
    text-align: center;
}

td:last-child {
    /* width: 400px; */
}

td {
    --_bg-color: attr(data-color);
    justify-items: start;
    min-height: 1rem !important;
    position: relative;
    background-color: var(--_bg-color, #ff00ff);
}
[data-fg-color="black"]{
    color: black
}
[data-fg-color="white"]{
    color: white
}

.chart {
    width: 600px
}

.chart>li {
    border: black solid 1px;
    position: relative;
    list-style: none;
    /* padding:0px; */

}

.chart .vlabel {
    position: absolute;
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-100%);
}

.chart .hlabel {
    position: absolute;
    display: inline-block;

    /* transform: translateX(-100%); */
}

li:has(.vlabel) {
    display: block;
    min-height: 1rem;
    /* width:4rem; */
    outline: red solid 2px
}

li:has(.hlabel) {
    display: block;
    min-height: 1rem;
    min-width: 250px;
}

.gss-icon {
    position: absolute;

    bottom: 2px;
    right: 2px
}

.chart ul {
    outline: magenta 1px solid;
    padding-left: 6rem;
    list-style: none;
    position: relative
}

.chart ul:has(.vlabel) {
    padding-left: 3rem
}

.chart li {
    position: relative;
    outline: lime solid 1px;
    min-height: 2rem;
}

ul:has(.wide) {
    min-width: 8rem;
}
td{
    max-height: 10rem !important;
}
</style>