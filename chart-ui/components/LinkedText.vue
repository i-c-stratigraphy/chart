<script setup>
import { computed } from "vue";
import { linkText } from "~/utils/link-text.mjs";

const props = defineProps({ text: { type: String, required: true } });
const parts = computed(() => linkText(props.text));
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <a v-if="part.href" :href="part.href" target="_blank" rel="noreferrer">{{ part.text }}</a>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<style scoped>
a {
  color: #0000ee;
  text-decoration: underline;
}
</style>
