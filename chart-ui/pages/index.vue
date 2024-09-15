<script setup>
// import jsonRawData from "@/assets/chart.json";
import ChartGridPrecambrian from "~/components/ChartGridPrecambrian.vue";
import { onlyUnique } from "~/utils/util";

const ready = ref(false)
const error = ref(null)
const data = ref([])
const dataLookup = ref({})
const showInfo = ref(false)
const info = ref(null)
function getSubChart(segment, idx) {
    return fetch(`/chart-data/chart.${segment}.json`).then(r => {
        if (!r.ok || (r.status > 300)) {
            throw "error"
        }
        return r
    }).then(r => {
        return r.json()
    }).then(r => {
        data.value[idx] = r
    }).catch((err) => {
        error.value = { ...error.value, files: [...error.value.files, `chart-${segment}`], message: "Error fetching chart files" }
        throw err
    })
}
onMounted(() => {
    const timeout = setTimeout(() => { error.value = { message: "Timed out fetching chart data" } }, 20 * 1000)
    Promise.all([
        getSubChart(1, 0),
        getSubChart(2, 1),
        getSubChart(3, 2),
        getSubChart(4, 3),

    ]).then(all => {
        ready.value = true
        clearTimeout(timeout)
        data.value.forEach(elem => {
            flattenData(elem)
        });
        localStorage.setItem("lookup",JSON.stringify(dataLookup.value))
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
        value: "log"
    },
    {
        name: "Linear",
        value: "linear"
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

const langs = computed(() => {
    if (data.length < 1) {
        return ["en"]
    }
    return data.value.reduce(flattenLangs, []).flat().filter(x => x != undefined).map(x => x["@language"]).filter(onlyUnique)
})
function flattenData(node) {
    if (node.narrower) {
        node.narrower.forEach(n => {
            flattenData(n)
        })
    }
    dataLookup.value[node.id] = { ...node }
}

const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
});
const handleView = (node) => {
    console.log(node)
    info.value = dataLookup.value[node]
    showInfo.value = true
}
</script>
<template>
    <teleport to="body">
        <div class="lightbox" v-if="showInfo" @click.self="showInfo = false">
            <div class="content">
                <InfoBox :node="info" :key="info.id" :lang="selectedLang" @view="handleView"
                    @close="showInfo = false" />
                <!-- <pre>{{ info }}</pre> -->
            </div>
        </div>
    </teleport>
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
                    <select v-model="selectedScale">
                        <option v-for="scale in scaleOptions" :value="scale">{{ scale.name }}</option>
                    </select>

                </label>
            </div>
            <div class="grid-4">
                <ChartGrid :node="data[0]" :lang="selectedLang" :key="'1' + selectedLang" :scaling="selectedScale"
                    @view="handleView" />
                <ChartGrid :node="data[1]" :lang="selectedLang" :key="'2' + selectedLang" :scaling="selectedScale"
                    @view="handleView" />
                <ChartGrid :node="data[2]" :lang="selectedLang" :key="'3' + selectedLang" :scaling="selectedScale"
                    @view="handleView" />
                <ChartGridPrecambrian :node="data[3]" :lang="selectedLang" :key="'4' + selectedLang"
                    :scaling="selectedScale" @view="handleView" />
            </div>
        </div>
    </div>
</template>
<style>
* {

    box-sizing: border-box;
}

body {
    print-color-adjust: exact;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style scoped>
.error-banner {
    padding: 1.5rem;
    border: solid red 2px;
    border-radius: 1rem
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
    /* max-width: fit-content; */
    max-height: 8rem;
}

.chart-controls {
    display: flex;
    gap: 1rem;
}

.lightbox {
    position: absolute;
    inset: 0;
    height: 100%;
    display: flex;
    align-items: center;
    position: fixed;
    z-index: 999;
    background-color: rgba(0 0 0 /0.6);
}

.lightbox>.content {
    background-color: white;
    /* border:black solid 2px;  */
    /* border-radius: 2rem; */
    max-height: calc(100svh - 4rem);
    overflow: hidden;
    width: 600px;
    max-width: 90vw;
    margin-inline: auto;
    margin-block: 4rem;
}

@media print {
    .no-print {
        visibility: hidden;
    }
}

/* Small devices (landscape phones, 576px and up) */
.grid-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 576px) {
    .grid-4 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
    .grid-4 {}
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
    .grid-4 {}
}

/* X-Large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
    .grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/* XX-Large devices (larger desktops, 1400px and up) */
@media (min-width: 1400px) {
    .grid-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>