<script setup lang="ts">
import { computed } from "vue";
import { useLabelContext, type LabelType } from "@/utils/label";

const NS = {
  gts: "http://resource.geosciml.org/ontology/timescale/gts#",
  strat: "https://data.stratigraphy.org/data/strat/",
};

const headerRankMap: Record<
  string,
  { chronometric: string; stratigraphic: string }
> = {
  "https://data.stratigraphy.org/data/gts/Ages": {
    chronometric: `${NS.gts}Age`,
    stratigraphic: `${NS.strat}Stage`,
  },
  "https://data.stratigraphy.org/data/gts/Epochs": {
    chronometric: `${NS.gts}Epoch`,
    stratigraphic: `${NS.strat}Series`,
  },
  "https://data.stratigraphy.org/data/gts/Periods": {
    chronometric: `${NS.gts}Period`,
    stratigraphic: `${NS.strat}System`,
  },
  "https://data.stratigraphy.org/data/gts/Eras": {
    chronometric: `${NS.gts}Era`,
    stratigraphic: `${NS.strat}Erathem`,
  },
  "https://data.stratigraphy.org/data/gts/Eons": {
    chronometric: `${NS.gts}Eon`,
    stratigraphic: `${NS.strat}Eonothem`,
  },
  "https://data.stratigraphy.org/data/gts/SuperEons": {
    chronometric: `${NS.strat}Supereon`,
    stratigraphic: `${NS.strat}Supereonothem`,
  },
};

const props = defineProps<{
  iri: string;
  class: string;
  tag: string;
  labelType: LabelType;
}>();

const { getLabel } = useLabelContext();

const resolvedHeaderIri = computed(() => {
  const mapped = headerRankMap[props.iri];
  if (!mapped) {
    return props.iri;
  }
  return mapped[props.labelType];
});

const label = computed(() => getLabel(resolvedHeaderIri.value, props.labelType));
</script>

<template>
  <component :is="props.tag" :class="props.class">{{ label }}</component>
</template>
