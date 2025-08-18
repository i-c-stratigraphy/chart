<script setup lang="ts">
import { computed } from "vue";
import n3 from "n3";
import { useLabelContext } from "@/utils/label";

const { namedNode } = n3.DataFactory;

const props = defineProps<{
  iri: string;
  class: string;
  tag: string;
}>();

const { getLabel } = useLabelContext();

// TODO: add support for language variants once the data is available.
// Now just use the default language.
const label = computed(() => getLabel(namedNode(props.iri), "shortform", true));
</script>

<template>
  <component :is="props.tag" :class="props.class">{{ label }}</component>
</template>
