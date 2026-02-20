<script setup>
import {
  scaleOptions,
  getScaleOptionLabel,
  getScaleObj,
} from "~/utils/util";
import { useRouteQuery } from "@vueuse/router";
import { computed, ref, onMounted, watch, shallowRef } from "vue";
import { createLabelProvider } from "@/utils/label";
import { useRDFStore } from "@/utils/rdfStore";
import { useLayoutEngine } from "@/utils/layout";
import n3 from "n3";

const { namedNode } = n3.DataFactory;

const NS = {
  dcterms: "http://purl.org/dc/terms/",
  owl: "http://www.w3.org/2002/07/owl#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  cs: "http://resource.geosciml.org/classifier/ics/ischart",
  icsVisual: "http://resource.geosciml.org/ontology/ics-visual-chart/",
};

const target = useRouteQuery("target", "");
const selectedLang = useRouteQuery("language", "en");
const selectedScale = useRouteQuery("scale", scaleOptions[0]);
const showInfo = computed(() => target.value !== "");

const infoTarget = ref(null);
const ready = ref(false);
const error = ref(null);
const data = ref([]);
const meta = ref(undefined);
const pdfVersion = ref("");
const downloadVersion = ref("");
const layoutEngine = shallowRef(null);
const pdfVersionError = ref(false);

const setChartReadyState = (state) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.chartReady = state;
};

const labelTypeOptions = [
  { label: "Stratigraphic", value: "stratigraphic" },
  { label: "Chronometric", value: "timescale" },
];
const labelType = ref(labelTypeOptions[0].value);

const { cf, loadStore, error: rdfError } = useRDFStore();
const { getLabel } = createLabelProvider(cf, selectedLang, labelType);

watch(
  [ready, error, rdfError],
  ([isReady, localError, storeError]) => {
    if (isReady) {
      setChartReadyState("1");
      return;
    }
    if (localError || storeError) {
      setChartReadyState("error");
      return;
    }
    setChartReadyState("0");
  },
  { immediate: true }
);

function extractMeta(pointer) {
  const cs = pointer.node(namedNode(NS.cs));
  const blurb = pointer.node(namedNode(`${NS.icsVisual}Blurb`));
  // Keep `scopeNote` key for compatibility with existing rendering helpers.
  const scopeNote = blurb
    .out(namedNode(NS.skos + "prefLabel"))
    .terms.filter((t) => t.termType === "Literal" && t.value !== "")
    .map((t) => ({
      language: t.language,
      value: t.value,
    }));

  return {
    id: NS.cs,
    versionInfo: cs.out(namedNode(NS.owl + "versionInfo")).term?.value || "",
    prefLabel: {
      value: cs.out(namedNode(NS.skos + "prefLabel")).term?.value || "",
    },
    creator: {
      url:
        cs.out(namedNode(NS.dcterms + "creator")).term?.value ||
        "www.stratigraphy.org",
    },
    scopeNote,
  };
}

function resolveInfoTarget(iri) {
  if (!iri || !layoutEngine.value) {
    return null;
  }
  try {
    // Build directly from RDF so relations are not tied to filtered chart segments.
    return layoutEngine.value.buildNode(iri, 1);
  } catch (e) {
    console.error(`Error resolving chart node ${iri}`, e);
    return null;
  }
}

const chartReleaseVersion = computed(() => {
  return pdfVersion.value || meta.value?.versionInfo || "";
});

onMounted(async () => {
  setChartReadyState("0");
  await loadStore();
  if (!cf.value) {
    error.value = new Error("Failed to load RDF chart data.");
    setChartReadyState("error");
    return;
  }

  layoutEngine.value = useLayoutEngine(cf.value);
  data.value = layoutEngine.value.getSegments();
  meta.value = extractMeta(cf.value);
  infoTarget.value = resolveInfoTarget(target.value);
  ready.value = true;

  try {
    const v = await (
      await fetch(
        "https://data.jsdelivr.com/v1/packages/gh/i-c-stratigraphy/chart"
      )
    ).json();
    const regexp = new RegExp(/(\d)*\.(\d)*\.(\d)*/);
    const version = v.versions.find((x) => regexp.test(x.version));
    pdfVersion.value = version?.version ?? "";
  } catch (e) {
    pdfVersionError.value = true;
    console.error("Error fetching pdf version", e);
  }
});

const langs = computed(() => {
  if (!cf.value) return ["en"];
  const languages = cf.value
    .out(namedNode(NS.skos + "prefLabel"))
    .terms.map((t) => t.language)
    .filter((l) => l && l !== "");

  const validLanguages = languages.filter((l) => {
    try {
      new Intl.DisplayNames([l], { type: "language" });
      return true;
    } catch (e) {
      return false;
    }
  });

  return Array.from(new Set(["en", ...validLanguages])).sort();
});

const languageNames = computed(() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" });
  } catch (e) {
    return { of: (l) => l };
  }
});

const getLocalLangName = (lang) => {
  try {
    return new Intl.DisplayNames([lang], { type: "language" }).of(lang) || lang;
  } catch (e) {
    const normalizedLang = lang.split("-")[0];
    try {
      return (
        new Intl.DisplayNames(["en"], { type: "language" }).of(normalizedLang) ||
        lang
      );
    } catch (e2) {
      return lang;
    }
  }
};

const handleView = (node) => {
  target.value = node;
};

const chartTitle = computed(() => {
  if (!meta.value) return "loading";
  return getLabel(NS.cs);
});

const commissionTitle = computed(() => {
  if (!meta.value) return "loading";
  // Simplified for now, could resolve from a specific IRI if needed
  return "International Commission on Stratigraphy";
});

watch(target, (newTarget) => {
  infoTarget.value = resolveInfoTarget(newTarget);
});

const downloadPdf = () => {
  if (!chartReleaseVersion.value || !meta.value?.versionInfo) {
    return;
  }

  const versionInfo = meta.value?.versionInfo || "";
  const link = `https://github.com/i-c-stratigraphy/chart/releases/download/v${chartReleaseVersion.value}/ICS_Chart_${versionInfo}${downloadVersion.value ? `_${downloadVersion.value}` : ""}.pdf`;
  const a = document.createElement("a");
  a.href = link;
  a.download = link.split("/").pop() || "chart.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
</script>
<template>
  <div class="dynamic-chart">
    <teleport to="body">
      <div
        class="lightbox"
        v-if="showInfo && infoTarget"
        @click.self="target = ''"
      >
        <div class="content">
          <InfoBox
            :node="infoTarget"
            :key="infoTarget.id"
            :lang="selectedLang"
            @view="handleView"
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
        <h2>{{ meta.creator?.url }}</h2>
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 1">
        <h2>{{ commissionTitle }}</h2>
      </div>
      <div class="cell" style="--_col-span: 1; --_row-span: 1">
        <h2>v{{ meta.versionInfo.replace("-", "/") }}</h2>
      </div>
    </div>

    <div v-if="rdfError || error" class="error-banner">
      {{ (rdfError || error).message }}
    </div>
    <div v-else>
      <div v-if="!ready">LOADING</div>
      <div v-else>
        <div class="no-print chart-controls widther">
          <label>
            Language:
            <select v-model="selectedLang">
              <option v-for="lang in langs" :key="lang" :value="lang">
                {{ languageNames.of(lang) }} ({{ getLocalLangName(lang) }})
              </option>
            </select>
          </label>
          <label>
            Scaling:
            <select v-model="selectedScale">
              <option v-for="scale in scaleOptions" :key="scale" :value="scale">
                {{ getScaleOptionLabel(scale) }}
              </option>
            </select>
          </label>
          <label>
            Column headings:
            <select v-model="labelType">
              <option
                v-for="label in labelTypeOptions"
                :key="label.value"
                :value="label.value"
              >
                {{ label.label }}
              </option>
            </select>
          </label>
          <label>
            Download:
            <select v-model="downloadVersion">
              <option value="">Main</option>
              <option v-for="lang in langs" :key="lang" :value="lang">
                {{ languageNames.of(lang) }} ({{ getLocalLangName(lang) }})
              </option>
            </select>
            <button @click="downloadPdf">
              Data-generated PDF (test version)
            </button>
            <small v-if="pdfVersionError && chartReleaseVersion">
              Using fallback version from chart metadata.
            </small>
          </label>
        </div>
        <div class="grid-4">
          <ChartGridCombined
            v-for="num in 4"
            :node="data[num - 1]"
            :lang="selectedLang"
            :key="num - 1 + selectedLang"
            :scaling="getScaleObj(selectedScale)"
            :label-type="labelType"
            :kind="num === 4 ? 'precambrian' : 'default'"
            :meta="meta"
            @view="handleView"
          />
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
