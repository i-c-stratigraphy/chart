<script setup lang="ts">
import navigation from "~/assets/navigation.json";
const menuOpen = ref(false);
const base = useRuntimeConfig().app.baseURL;
const banner = ref(base + "images/banner-01.png");
onMounted(() => {
  banner.value = base + "images/banner-" + String(Math.floor(Math.random() * 8) + 1).padStart(2, "0") + ".png";
});
</script>

<template>
  <div class="ics-site-header">
    <a class="ics-skip-link" href="#main-content">Skip to main content</a>
    <header class="ics-title-bar">
      <a class="ics-logo" href="https://stratigraphy.org/" aria-label="International Commission on Stratigraphy home"
         :style="{ maskImage: 'url(' + base + 'images/logo-ics-3D-dark.png)' }">
        <img :src="base + 'images/logo-ics-3D-dark.png'" alt="ICS logo">
      </a>
      <h1>International Commission on Stratigraphy</h1>
    </header>
    <nav class="ics-navbar" aria-label="Main navigation">
      <button class="ics-menu-toggle" type="button" aria-controls="navMenu"
              :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">Menu</button>
      <div id="navMenu" class="ics-nav-items" :class="{ 'is-open': menuOpen }">
        <a href="https://stratigraphy.org/">Home</a>
        <div v-for="item in navigation" :key="item.name" class="ics-nav-group">
          <a :href="item.link" :class="{ 'ics-nav-highlight': item.highlight }">{{ item.name }}</a>
          <div v-if="item.dropdown" class="ics-nav-dropdown">
            <a v-for="child in item.dropdown" :key="child.name" :href="child.link">{{ child.name }}</a>
          </div>
        </div>
      </div>
    </nav>
    <div id="ics-banner" class="ics-hero" :style="{ backgroundImage: 'url(' + banner + ')' }" aria-hidden="true"></div>
    <div class="ics-chart-introduction">
      <h2>International Chronostratigraphic Chart</h2>
      <p>This interactive chart presents the time periods and hierarchy of stratigraphic names of Earth's geological
        history in multiple languages.</p>
      <p>For older versions and supporting material, see
        <a href="https://stratigraphy.org/supplementary">Supplementary Chart Information</a>.</p>
    </div>
  </div>
</template>
