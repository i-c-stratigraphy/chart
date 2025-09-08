<script setup>
import {
  onlyUnique,
  scaleOptions,
  getScaleOptionLabel,
  getScaleObj,
  getTitleLangVariant,
} from "~/utils/util";
import { useRouteQuery } from "@vueuse/router";
import { computed } from "vue";
import { createLabelProvider } from "@/utils/label";
// import type {  chartMeta } from "~/utils/util";

const target = useRouteQuery("target", "");
const selectedLang = useRouteQuery("language", "en");
const selectedScale = useRouteQuery("scale", scaleOptions[0]);

const useCDN = false;

const dataLookup = ref({});
const infoTarget = ref(null);
const ready = ref(false);
const error = ref(null);
const data = ref([]);
const meta = ref(undefined);
const showInfo = computed(() => target.value !== "");
const labelsData = ref("");
const chartRDFData = ref("");
const labelTypeOptions = [
  {
    label: "Stratigraphic",
    value: "stratigraphic",
  },
  {
    label: "Chronometric",
    value: "timescale",
  },
];
const labelType = ref(labelTypeOptions[0].value);
createLabelProvider([chartRDFData, labelsData], selectedLang, labelType);

function getMeta() {
  const apiUrl = useCDN
    ? "https://cdn.jsdelivr.net/gh/i-c-stratigraphy/chart@gh-pages"
    : "https://stratigraphy.org/chart";

  return fetch(`${apiUrl}/chart.meta.json?cachebreaker=${Math.random()}`)
    .then((r) => {
      if (!r.ok || r.status > 300) {
        throw "error";
      }
      return r;
    })
    .then((r) => {
      return r.json();
    })
    .then((r) => {
      meta.value = r;
    })
    .catch((err) => {
      error.value = {
        ...error.value,
        files: [...error.value.files, `chart-${segment}`],
        message: "Error fetching chart files",
      };
      throw err;
    });
}
function getSubChart(segment, idx) {
  const apiUrl = useCDN
    ? "https://cdn.jsdelivr.net/gh/i-c-stratigraphy/chart@gh-pages"
    : "https://stratigraphy.org/chart/";
  const seg = segment !== "" ? `.${segment}` : "";

  return fetch(`${apiUrl}/chart${seg}.json?cachebreaker=${Math.random()}`)
    .then((r) => {
      if (!r.ok || r.status > 300) {
        throw "error";
      }
      return r;
    })
    .then((r) => {
      return r.json();
    })
    .then((r) => {
      data.value[idx] = r;
    })
    .catch((err) => {
      error.value = {
        ...error.value,
        files: [...error.value.files, `chart-${segment}`],
        message: "Error fetching chart files",
      };
      throw err;
    });
}
function getChartRDFData() {
  const apiUrl = useCDN
    ? "https://cdn.jsdelivr.net/gh/i-c-stratigraphy/chart@gh-pages"
    : "https://stratigraphy.org/chart";

  return fetch(`${apiUrl}/chart.ttl?cachebreaker=${Math.random()}`)
    .then((r) => {
      if (!r.ok || r.status > 300) {
        throw "error";
      }
      return r;
    })
    .then((r) => {
      return r.text();
    })
    .then((r) => {
      chartRDFData.value = r;
    });
}
function getSKOSXLLabelsData() {
  const apiUrl = useCDN
    ? "https://cdn.jsdelivr.net/gh/i-c-stratigraphy/chart@gh-pages"
    : "https://stratigraphy.org/chart";

  return fetch(`${apiUrl}/xlsx.ttl?cachebreaker=${Math.random()}`)
    .then((r) => {
      if (!r.ok || r.status > 300) {
        throw "error";
      }
      return r;
    })
    .then((r) => {
      return r.text();
    })
    .then((r) => {
      labelsData.value = r;
    });
}
const pdfVersion = ref("");
const downloadVersion = ref("");
onMounted(async () => {
  const timeout = setTimeout(() => {
    error.value = { message: "Timed out fetching chart data" };
  }, 20 * 1000);
  await getMeta();
  await Promise.all([
    getChartRDFData(),
    getSKOSXLLabelsData(),
    getSubChart(1, 0),
    getSubChart(2, 1),
    getSubChart(3, 2),
    getSubChart(4, 3),
    getSubChart("hierarchy", 4),
    // getSubChart("meta", 5),
  ])
    .then((all) => {
      clearTimeout(timeout);
      data.value.forEach((elem) => {
        if (elem.scopedNote) {
          return;
        }
        flattenData(elem);
      });
      infoTarget.value = target.value ? dataLookup.value[target.value] : null;
      ready.value = true;
    })
    .catch((e) => {
      error.value = { message: `An error occurred grabbing chart data ${e}` };
    });
  //"https://api.github.com/repos/i-c-stratigraphy/chart/tags"
  const v = await (
    await fetch(
      "https://data.jsdelivr.com/v1/packages/gh/i-c-stratigraphy/chart"
    )
  ).json();
  const regexp = new RegExp(/(\d)*\.(\d)*\.(\d)*/);
  // console.log(v.versions.filter(x=> regexp.test(x.version) )[0].version ?? ''    )
  pdfVersion.value =
    v.versions.filter((x) => regexp.test(x.version))[0].version ?? "";
  console.log(v.versions.filter((x) => regexp.test(x.version)));
});

const flattenLangs = (acc, cur) => {
  if (cur.narrower) {
    cur.narrower.reduce(flattenLangs, acc);
  }
  if (Array.isArray(cur.altLabel)) {
    acc.push([cur.prefLabel, ...cur.altLabel]);
  } else {
    acc.push([cur.prefLabel, cur.altLabel]);
  }
  return acc;
};

const langs = computed(() => {
  if (data.length < 1) {
    return ["en"];
  }
  return data.value
    .reduce(flattenLangs, [])
    .flat()
    .filter((x) => x != undefined)
    .map((x) => x.language)
    .filter(onlyUnique);
});
function flattenData(node) {
  if (node.narrower) {
    node.narrower.forEach((n) => {
      flattenData(n);
    });
  }
  dataLookup.value[node.id] = JSON.parse(JSON.stringify(node));
}

const languageNames = new Intl.DisplayNames(["en"], {
  type: "language",
});
const handleView = (node) => {
  target.value = node;
  infoTarget.value = dataLookup.value[target.value];
};
const versionInfo = computed(() => {
  return meta.value.versionInfo;
});
const downloadLink = computed(() => {
  return `https://github.com/i-c-stratigraphy/chart/releases/download/v${pdfVersion.value}/ICS_Chart_${versionInfo.value}${downloadVersion.value ? `_${downloadVersion.value}` : ""}.pdf`;
});
const downloadPdf = (e) => {
  const link = downloadLink.value;
  const a = document.createElement("a");
  a.href = link;
  a.download = link.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
watch(
  dataLookup,
  (newValue) => {
    infoTarget.value = newValue[target.value];
  },
  { deep: true }
);
const chartTitle = computed(() => {
  if (!meta.value) {
    return "loading";
  }
  return getTitleLangVariant(meta.value, selectedLang.value);
});
const commissionTitle = computed(() => {
  if (!meta.value) {
    return "loading";
  }
  if (!meta.value.creator) {
    return "loading";
  }
  return getNameLangVariant(meta.value.creator, selectedLang.value);
});
</script>
<template>
  <div class="dynamic-chart">
    <teleport to="body">
      <div
        class="lightbox"
        v-if="showInfo && infoTarget && dataLookup"
        @click.self="target = ''"
      >
        <div class="content">
          <InfoBox
            :node="infoTarget"
            :key="infoTarget.id"
            :lang="selectedLang"
            @view="handleView"
            :hierarchy="data[4]"
            @close="target = ''"
          />
        </div>
      </div>
    </teleport>

    <div class="grid-5 only-print" v-if="meta">
      <div class="cell" style="--_col-span: 1; --_row-span: 2">
        <img src="/IUGSLOGOright.gif" />
      </div>
      <div class="cell" style="--_col-span: 3; --_row-span: 1">
        <h1>{{ chartTitle }}</h1>
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 2">
        <img src="/logo-ics-3D-dark.png" />
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 1">
        <h2>{{ meta ? meta.creator?.url : "www.stratigraphy.org" }}</h2>
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 1">
        <h2>{{ commissionTitle }}</h2>
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 1">
        <h2>v{{ meta.versionInfo.replace("-", "/") }}</h2>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      {{ error.message }}
      <ul v-if="error.files">
        <li v-for="f in error.files">{{ f }}</li>
      </ul>
    </div>
    <div v-else>
      <div v-if="!ready">LOADING</div>
      <div v-else>
        <div class="no-print chart-controls widther">
          <label>
            Language:
            <select v-model="selectedLang">
              <option v-for="lang in langs" :value="lang">
                {{ languageNames.of(lang) }} ({{
                  new Intl.DisplayNames([lang], { type: "language" }).of(lang)
                }})
              </option>
            </select>
          </label>
          <label>
            Scaling:
            <select v-model="selectedScale">
              <option v-for="scale in scaleOptions" :value="scale">
                {{ getScaleOptionLabel(scale) }}
              </option>
            </select>
          </label>
          <label>
            Column headings:
            <select v-model="labelType">
              <option v-for="label in labelTypeOptions" :value="label.value">
                {{ label.label }}
              </option>
            </select>
          </label>
          <label v-if="pdfVersion != ''">
            Download:
            <select v-model="downloadVersion">
              <option value="">Main</option>
              <option v-for="lang in langs" :key="lang" :value="lang">
                {{ languageNames.of(lang) }} ({{
                  new Intl.DisplayNames([lang], { type: "language" }).of(lang)
                }})
              </option>
            </select>
            <button @click="downloadPdf">
              Data-generated PDF (test version)
            </button>
          </label>
        </div>
        <div class="grid-4">
          <ChartGridCombined
            v-for="num in 4"
            :node="data[num - 1]"
            :lang="selectedLang"
            :key="num - 1 + selectedLang"
            :scaling="getScaleObj(selectedScale)"
            :kind="num === 4 ? 'precambrian' : 'default'"
            :meta="meta"
            @view="handleView"
          />
          <!-- <ChartGrid :node="data[0]" :lang="selectedLang" :key="'1' + selectedLang"
                        :scaling="getScaleObj(selectedScale)" @view="handleView" />
                    <ChartGrid :node="data[1]" :lang="selectedLang" :key="'2' + selectedLang"
                        :scaling="getScaleObj(selectedScale)" @view="handleView" />
                    <ChartGrid :node="data[2]" :lang="selectedLang" :key="'3' + selectedLang"
                        :scaling="getScaleObj(selectedScale)" @view="handleView" />
                    <ChartGridPrecambrian :node="data[3]" :lang="selectedLang" :key="'4' + selectedLang"
                        :scaling="getScaleObj(selectedScale)" @view="handleView" /> -->
        </div>
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
@media print {
  .only-print {
    display: grid !important;
  }

  .dynamic-chart {
    box-shadow: none !important;
  }
}

.dynamic-chart {
  background-color: white;
  padding: 1rem;
  box-shadow: 0pt 0pt 3px rgb(136, 136, 136);
}

.error-banner {
  padding: 1.5rem;
  border: solid red 2px;
  border-radius: 1rem;
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
  box-shadow: none;
  justify-content: space-between;
  flex-wrap: wrap;
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

.lightbox > .content {
  background-color: white;
  max-height: calc(100svh - 4rem);
  overflow: hidden;
  width: 600px;
  max-width: 90vw;
  margin-inline: auto;
  margin-block: 4rem;
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
  .grid-4 {
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
  .grid-4 {
  }
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

@media print {
  .grid-5 h1 {
    font-size: 1.9em;
    font-weight: 500;
  }
  /* .grid-5 h1, */
  .grid-5 h2 {
    font-size: 1.6em;
    margin-top: 0px;
  }

  .grid-5 img {
    max-height: 4rem;
  }

  .grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }

  .chart-notes {
    font-size: 0.6em;
  }
}
</style>
