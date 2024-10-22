<template>

  <!-- <StratigraphyHeader class="no-print"/> -->
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
    .grid-7, .precambrian-grid{
        margin-top:2rem !important;
    }
}
@page {
  size: A3 landscape;
  margin:0px;
}
.content{
  background-color: white;
}
/*
js deliver chart versions 
*/
</style>