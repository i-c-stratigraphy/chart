<script setup lang="ts">
import { computed } from "vue"
import { type chartNode, type chartMeta, type scalingFactor } from "@/utils/util"
import { useLabelContext, type LabelType } from "@/utils/label"

const props = defineProps<{
    node: chartNode,
    lang: string,
    scaling: scalingFactor,
    labelType: LabelType,
    kind: 'default' | 'precambrian',
    meta?: chartMeta,
}>()

const emit = defineEmits<{
    (e: 'view', node: string): void
}>()

const NS = {
    dcterms: "http://purl.org/dc/terms/",
    icsVisual: "http://resource.geosciml.org/ontology/ics-visual-chart/",
    schema: "https://schema.org/",
}

const BLURB_SECTIONS = [
    { iri: `${NS.icsVisual}Blurb`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.icsVisual}ccgm`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.dcterms}contributor`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.dcterms}bibliographicCitation`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.schema}copyrightNotice`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.schema}license`, kind: "text", fallbackToEnglish: true },
    { iri: `${NS.icsVisual}translator`, kind: "text", fallbackToEnglish: false },
    { iri: `${NS.icsVisual}translatorURL`, kind: "link", fallbackToEnglish: false },
    { iri: `${NS.icsVisual}translatorLogo`, kind: "image", fallbackToEnglish: false },
] as const

const { getUiLabel, getUiLabelOptional } = useLabelContext()

const blurbSections = computed(() => {
    return BLURB_SECTIONS.flatMap((section) => {
        const value = getUiLabelOptional(section.iri, props.lang, section.fallbackToEnglish)
        if (!value) {
            return []
        }

        if (section.iri === `${NS.icsVisual}Blurb`) {
            return value
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter((paragraph) => paragraph !== "")
                .map((paragraph, index) => ({
                    ...section,
                    iri: `${section.iri}#${index}`,
                    value: paragraph,
                }))
        }

        return [{ ...section, value }]
    })
})

</script>
<template>
    <div class="grid-wrapper">
        <div class="grid-7" v-if="props.kind == 'default'">
            <ChartHeader tag="div" class="header v-text" iri="http://resource.geosciml.org/classifier/ics/ischart/Eons" :label-type="props.labelType" />
            <ChartHeader tag="div" class="header v-text" iri="http://resource.geosciml.org/classifier/ics/ischart/Eras" :label-type="props.labelType" />
            <ChartHeader tag="div" class="header v-text" iri="http://resource.geosciml.org/classifier/ics/ischart/Periods" :label-type="props.labelType" />
            <ChartHeader tag="div" class="headerx col-span-2" iri="http://resource.geosciml.org/classifier/ics/ischart/Epochs" :label-type="props.labelType" />
            <div style="position:relative">
                <ChartHeader tag="span" class="header" iri="http://resource.geosciml.org/classifier/ics/ischart/Ages" :label-type="props.labelType" />
                <span class="gssp-text v-text">GSSP</span>
            </div>
            <div class="header center age-text">{{ getUiLabel(`${NS.icsVisual}NumericAge`, "Numeric Age") }}</div>
            <ChartGridCell :lang="props.lang" :node="props.node" :parent-rank="''" :scaling="props.scaling"
                @view="n => emit('view', n)" />
        </div>
        <template v-else>
            <div class="grid-5 precambrian-grid">
                <ChartHeader tag="div" class="header v-text" iri="http://resource.geosciml.org/classifier/ics/ischart/SuperEons" :label-type="props.labelType" />
                <ChartHeader tag="div" class="header v-text" iri="http://resource.geosciml.org/classifier/ics/ischart/Eons" :label-type="props.labelType" />
                <ChartHeader tag="div" class="headerx" iri="http://resource.geosciml.org/classifier/ics/ischart/Eras" :label-type="props.labelType" />
                <div  style="position:relative">
                    <ChartHeader tag="span" class="header" iri="http://resource.geosciml.org/classifier/ics/ischart/Periods" :label-type="props.labelType" />
                    <span class="v-text gssp-text ">GSSP<br/> GSSA</span>
                </div>
                <div class="header center age-text">{{ getUiLabel(`${NS.icsVisual}NumericAge`, "Numeric Age") }}</div>
                <ChartGridPrecambrianCell :lang="props.lang" :node="props.node" :parent-rank="''"
                    :scaling="props.scaling" @view="x => emit('view', x)" />
            </div>
            <div class="chart-notes" v-if="props.meta" :lang="props.lang">
                <template v-for="section in blurbSections" :key="section.iri">
                    <p v-if="section.kind === 'text'">
                        {{ section.value }}
                    </p>
                    <p v-else-if="section.kind === 'link'">
                        <a :href="section.value" target="_blank" rel="noreferrer">
                            {{ section.value }}
                        </a>
                    </p>
                    <img
                        v-else
                        :src="section.value"
                        alt=""
                        class="translator-logo"
                    />
                </template>
            </div>
        </template>
    </div>
</template>
<style scoped>

.grid-5 {
    margin-top: 4rem;
    --_thin-col: 2rem;
    --_mid-col: 6fr;
    display: grid;
    grid-template-columns:
        repeat(2, var(--_thin-col)) repeat(3, var(--_wide-col, 1fr));
    /* font-size: 0.6em; */
}

.grid-5 :deep(div:last-child>.num-age-beginning) {
    display: block;
    transform: translate(-50%, 50%);
    bottom: 0px;
}

.grid-7 {
    margin-top: 4rem;
    --_thin-col: 2rem;
    --_mid-col: 6fr;
    --_wide-col: calc(var(--_thin-col, 3rem) + var(--_mid-col));
    display: grid;
    grid-template-columns: var(--_thin-col) var(--_thin-col) var(--_thin-col) var(--_thin-col) 1fr 1fr 1fr;
    /* font-size: 0.6em; */
}

.grid-7 :deep(div:last-child>.num-age-beginning) {
    display: block;
    transform: translate(-50%, 50%);
    bottom: 0px;
}

.header {
    position: relative;
    margin-bottom: 0.5rem;
    text-wrap: nowrap;
    /* height:1.5rem; */
    transform: rotate(-45deg)
}
.age-text{
    transform: rotate(0);
}
div.header:not(.v-text) {
    padding-left: 5px;
}

.col-span-2 {
    grid-column: span 2;
}

.gssp-text {
    position: absolute;
    right: 0;
    bottom:0;
    margin-bottom: 10px;
    margin-right: -15px;
    transform: 
    rotate(-90deg) 
}

.center {
    text-align: center;
}
.chart-notes{
    text-align: left;
    padding-top: 1rem;
    font-size:0.8em;
    line-height: 1em;
}
.chart-notes p {
    margin: 0 0 0.6em;
}
.chart-notes p:last-child {
    margin-bottom: 0;
}
.chart-notes a {
    color: inherit;
}
.translator-logo {
    display: block;
    max-width: 100%;
    max-height: 4rem;
    margin: 0.5rem 0;
}
.chart-notes:lang(zh),
.chart-notes:lang(ja) {
    font-size: 1.1rem;
    /* line-height: 1.1em; */
}

@media print {
    .chart-notes {
        font-size: 0.76em;
        line-height: 0.95em;
    }

    .chart-notes p {
        margin-bottom: 0.4em;
    }
}

</style>
