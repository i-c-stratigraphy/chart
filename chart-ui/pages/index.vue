<script setup>
// import jsonRawData from "@/assets/chart.json";
import ChartGridPrecambrian from "~/components/ChartGridPrecambrian.vue";
import { onlyUnique } from "~/utils/util";

const ready = ref(false)
const error = ref(null)
const data = ref([])
function getSubChart(segment, idx){
    console.log(`chart.${segment}.json => ${idx}`)
    return fetch(`/chart-data/chart.${segment}.json`).then(r=>{
            if (!r.ok || (r.status > 300)){
                throw "error"
            }
            return r
        }).then(r=>{
            return r.json()
        }).then(r=>{
            console.log(r)
            data.value[idx] = r
        }).catch((err)=>{
            error.value ={...error.value, files:[...error.value.files, `chart-${segment}`], message:"Error fetching chart files"} 
            throw err
        })
}
onMounted(() => {
    const timeout = setTimeout(()=>{error.value = {message:"Timed out fetching chart data"}},20*1000)
    Promise.all([
        getSubChart(1,0),
        getSubChart(2,1),
        getSubChart(3,2),
        getSubChart(4,3),

    ]).then(all=>{
        ready.value=true 
        clearTimeout(timeout)
    }).catch(() => {
        error.value = { message: "An error occured grabbing chart data" }
    })
})


const scaleOptions = [
    {
        name: "Equal",
        value: "none"
    },
    {
        name: "Logarithmic",
        value: "none"
    },
    {
        name: "Linear",
        value: "none"
    }
]

const selectedLang = ref("en");
const selectedScale = ref(scaleOptions[0]);

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
// const data  = [d1,d2,d3,d4]

const langs = computed(() => {
    if (data.length < 1) {
        return ["en"]
    }
    return data.value.reduce(flattenLangs, []).flat().filter(x => x != undefined).map(x => x["@language"]).filter(onlyUnique)
})


const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
});

</script>
<template>
    <div class="grid-5">
        <div class="cell" style="--_col-span: 1; --_row-span:2"><img src="/IUGSLOGOright.gif" /></div>
        <div class="cell" style="--_col-span: 3; --_row-span:1">
            <h1>INTERNATIONAL CHRONOSTRATIGRAPHIC CHART</h1>
        </div>
        <div class="cell" style="--_col-span: 1; --_row-span:2"><img src="/logo-ics-3D-dark.png" /></div>
        <div class="cell" style="--_col-span: 1; --_row-span:1">
            <h2>www.stratigraphy.org</h2>
        </div>
        <div class="cell" style="--_col-span: 1; --_row-span:1">
            <h2>International Commision on Stratigraphy</h2>
        </div>
        <div class="cell" style="--_col-span: 1; --_row-span:1">
            <h2>v2023/09</h2>
        </div>
    </div>
    <!-- {{ data }}{{ ready }}{{ error }} -->
    <div v-if="error" class="error-banner">
        {{ error.message }}
        <ul v-if="error.files">
            <li v-for="f in error.files">{{ f }}</li>
        </ul>
    </div>
    <div v-else>
        <div v-if="!ready">
            LOADING
        </div>
        <div v-else>
            <div class="no-print chart-controls">
                <label> Language:
                    <select v-model="selectedLang">
                        <option v-for="lang in langs" :value="lang">{{ languageNames.of(lang) }} ({{ new
                            Intl.DisplayNames([lang], { type: 'language' }).of(lang) }})</option>
                    </select>
                </label>
                <label> Scaling:
                    <select v-model="selectedScale" disabled>
                        <option v-for="scale in scaleOptions" :value="scale">{{ scale.name }}</option>
                    </select>
       
                </label>
            </div>
            <div class="grid-4">
                <ChartGrid :node="data[0]" :lang="selectedLang" :key="'1' + selectedLang" />
                <ChartGrid :node="data[1]" :lang="selectedLang" :key="'2' + selectedLang" />
                <ChartGrid :node="data[2]" :lang="selectedLang" :key="'3' + selectedLang" />
                <ChartGridPrecambrian :node="data[3]" :lang="selectedLang" :key="'4' + selectedLang" />
            </div>
        </div>
    </div>
</template>
<style>
body {
    print-color-adjust: exact;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style scoped>
.error-banner{
    padding:1.5rem;
    border: solid red 2px;
    border-radius:1rem
}
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.grid-5 {
    display: grid;
    grid-template-columns: min-content repeat(3, 1fr) min-content;
}

.cell {
    text-align: center;
    grid-column: span var(--_col-span, 1);
    grid-row: span var(--_row-span, 1);
}

.cell img {
    max-height: 8rem;
}

.chart-controls {
    display: flex;
    gap: 1rem;
}

@media print {
    .no-print {
        visibility: hidden;
    }
}
</style>