<script setup lang="ts">
import { computed } from "vue";
import { useLabelContext, type LabelType } from "@/utils/label";

const NS = {
  gts: "http://resource.geosciml.org/ontology/timescale/gts#",
  strat: "http://resource.geosciml.org/ontology/stratigraphy/",
};

const headerRankMap: Record<
  string,
  { timescale: string; stratigraphic: string }
> = {
  "http://resource.geosciml.org/classifier/ics/ischart/Ages": {
    timescale: `${NS.gts}Age`,
    stratigraphic: `${NS.strat}Stage`,
  },
  "http://resource.geosciml.org/classifier/ics/ischart/Epochs": {
    timescale: `${NS.gts}Epoch`,
    stratigraphic: `${NS.strat}Series`,
  },
  "http://resource.geosciml.org/classifier/ics/ischart/Periods": {
    timescale: `${NS.gts}Period`,
    stratigraphic: `${NS.strat}System`,
  },
  "http://resource.geosciml.org/classifier/ics/ischart/Eras": {
    timescale: `${NS.gts}Era`,
    stratigraphic: `${NS.strat}Erathem`,
  },
  "http://resource.geosciml.org/classifier/ics/ischart/Eons": {
    timescale: `${NS.gts}Eon`,
    stratigraphic: `${NS.strat}Eonothem`,
  },
  "http://resource.geosciml.org/classifier/ics/ischart/SuperEons": {
    timescale: `${NS.strat}Supereon`,
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
