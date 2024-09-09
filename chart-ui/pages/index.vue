<script setup >
// import jsonRawData from "@/assets/chart.json";
import d1 from "@/assets/chart.1.json";
import d2 from "@/assets/chart.2.json";
import d3 from "@/assets/chart.3.json";
import d4 from "@/assets/chart.4.json";
import ChartGridPrecambrian from "~/components/ChartGridPrecambrian.vue";

const scaleOptions = [
    {
        name:"Equal",
        value:"none"
    },
    {
        name:"Logarithmic",
        value:"none"
    },
    {
        name:"Linear",
        value:"none"
    }
]

const selectedLang = ref("en");
const selectedScale = ref(scaleOptions[0]);

// const rawData = jsonRawData
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
const data  = [d1,d2,d3,d4]

const langs = data.reduce(flattenLangs, []).flat().filter(x => x != undefined).map(x => x["@language"]).filter(onlyUnique)



const languageNames = new Intl.DisplayNames(['en'], {
  type: 'language'
});

</script>
<template>
    <div class="grid-5">
        <div class="cell" style="--_col-span: 1; --_row-span:2"><img src="/IUGSLOGOright.gif"/></div>
        <div class="cell" style="--_col-span: 3; --_row-span:1"> <h1>INTERNATIONAL CHRONOSTRATIGRAPHIC CHART</h1></div>
        <div class="cell" style="--_col-span: 1; --_row-span:2"><img src="/logo-ics-3D-dark.png"/></div>
        <div class="cell" style="--_col-span: 1; --_row-span:1"><h2>www.stratigraphy.org</h2></div>
        <div class="cell" style="--_col-span: 1; --_row-span:1"><h2>International Commision on Stratigraphy</h2></div>
        <div class="cell" style="--_col-span: 1; --_row-span:1"><h2>v2023/09</h2></div>
    </div>
   
<div class="no-print chart-controls">
    <label> Language:
    <select v-model="selectedLang">
        <option v-for="lang in langs" :value="lang">{{languageNames.of( lang) }}</option>
    </select>
</label>
<label> Scaling:
    <select v-model="selectedScale" disabled>
        <option v-for="scale in scaleOptions" :value="scale">{{scale.name }}</option>
    </select>
</label>
</div>
    <div class="grid-4">
        <ChartGrid :node="d1" :lang="selectedLang" :key="'1'+selectedLang"/>
        <ChartGrid :node="d2" :lang="selectedLang" :key="'2'+selectedLang"/>
        <ChartGrid :node="d3" :lang="selectedLang" :key="'3'+selectedLang"/>
        <ChartGridPrecambrian :node="d4" :lang="selectedLang" :key="'4'+selectedLang"/>
    </div>

</template>
<style>
body {
    print-color-adjust: exact;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style scoped>
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}
.grid-5 {
    display: grid;
    grid-template-columns: min-content repeat(3, 1fr) min-content;
}
.cell{
    text-align: center;
    grid-column: span var(--_col-span,1);
    grid-row: span var(--_row-span,1);
}
.cell img{
    max-height:8rem;
}
.chart-controls{
    display: flex ;
    gap:1rem;
}
@media print {
    .no-print{
        visibility: hidden;
    }
}
</style>