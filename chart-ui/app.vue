<template>
  <div class="content">
    <NuxtPage />
  </div>

</template>
<style>
*{
  box-sizing: border-box;
}
.only-print{
  display:none !important;
}
@media print {
    .no-print {
        visibility: hidden;
        display:none;
    }
    .only-print{
      display: unset !important;
    }
    p{
      font-size:0.6em;
    }
    .chart-notes{
      font-size:0.9em;
      line-height: 0.9em;
      margin-block: 0.9em;
    }
    .grid-7, .precambrian-grid{
        margin-top:2rem !important;
    }
}
.chart-notes{
      font-size:0.8em;
      line-height: 0.8em;
      margin-block: 0.8em;
    }
@page {
  size: A3 landscape;
  margin:0px;
}
</style>