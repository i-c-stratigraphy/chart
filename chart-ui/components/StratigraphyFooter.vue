<script setup lang="ts">
import navigation from "~/assets/navigation.json";
</script>

<template>
  <footer class="ics-site-footer no-print">
    <nav aria-label="Footer navigation">
      <a href="https://stratigraphy.org/">Home</a>
      <template v-for="item in navigation" :key="item.name">
        <a :href="item.link">{{ item.name }}</a>
        <a v-for="child in item.dropdown" :key="child.name" :href="child.link">{{ child.name }}</a>
      </template>
    </nav>
    <p>© 2013–{{ new Date().getFullYear() }} International Commission on Stratigraphy, all rights reserved.</p>
  </footer>
</template>
