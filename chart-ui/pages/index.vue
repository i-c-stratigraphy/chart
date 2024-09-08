<script setup >
import jsonRawData from "@/assets/chart.json";
import d1 from "@/assets/chart.1.json";
import d2 from "@/assets/chart.2.json";
import d3 from "@/assets/chart.3.json";
import d4 from "@/assets/chart.4.json";
import ChartGridPrecambrian from "~/components/ChartGridPrecambrian.vue";

const selectedLang = ref("en");
const rawData = jsonRawData
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

const flattenLangs = (acc, cur) => {
    if (cur.narrower) {
        cur.narrower.reduce(flattenLangs, acc)
    }
    if (Array.isArray(cur.altLabel)) {
        acc.push([cur.prefLabel, ...cur.altLabel])
    } else {
        acc.push([cur.prefLabel, cur.altLabel])
    }

    return acc
}


const langs = rawData.hasTopConcept.reduce(flattenLangs, []).flat().filter(x => x != undefined).map(x => x["@language"]).filter(onlyUnique)

const data = rawData

const splits = ['', '', '']

function getSplitData(root, splitStart, splitEnd) {



    return root.narrower[0]
}

const splitContent = [
data.hasTopConcept[0],
    // getSplitData(data.hasTopConcept[0], "", "Cretacieous"),
    getSplitData(data.hasTopConcept[0], "Jurassic", "Carboniferous"),
    getSplitData(data.hasTopConcept[0], "Devonian", "Cambrain"),
]

function getSubpaths(root /*chartNode*/, paths /*string[]*/)/* chartNode*/{
    // let newroot = {root, narrower:[]}
    const uPaths =  paths.map(path=>{
        const s = path.split(".")
        let sArr = []
        for(let i =0; 1 < s.length; i++){
            sArr.push(s.slice(0,i+1).join("."))
        }
        return sArr
    }).flat()
    console.log(uPaths)
}
// getSubpaths({}/*data.hasTopConcept[0]*/, ["Phanerozoic.Cenozoic.Quaternary"])


</script>
<template>
    <h1>chart</h1>
    <pre>
        <!-- {{ JSON.stringify(n1, null,2)||'broken' }} -->
    </pre>
    <select v-model="selectedLang">
        <option v-for="lang in langs" :value="lang">{{ lang }}</option>
    </select>
    <div class="grid-4">
        <!-- <ChartGrid v-for="splitNode in splitContent" :node="splitNode" :lang="selectedLang" /> -->
        <ChartGrid :node="d1" :lang="selectedLang" />
        <ChartGrid :node="d2" :lang="selectedLang" />
        <ChartGrid :node="d3" :lang="selectedLang" />
        <ChartGridPrecambrian :node="d4" :lang="selectedLang" />
    </div>

</template>
<style>
body {
    print-color-adjust: exact;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style>
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

/* table,
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


}

li:has(.vlabel) {
    display: block;
    min-height: 1rem;

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
} */
</style>