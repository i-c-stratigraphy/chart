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
      font-size:0.8em;
      line-height: 0.8em;
      margin-block: 6px;
    }
    .grid-7, .precambrian-grid{
        margin-top:2rem !important;
    }
}
@page {
  size: A3 landscape;
  margin:0px;
}

</style>