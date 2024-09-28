<template>
  <div class="alert-alpha no-print">
    <p>This is an early access version of a Stratographic Chart derived from data in the triple store</p>
  </div>
  <div>
    <NuxtPage />
  </div>
</template>
<style>
*{
  box-sizing: border-box;
}
.alert-alpha{
  height: 6rem; 
  padding:1rem;
  /* background-color:rgb(217, 217, 2); */
  border: 1px black solid;
  border-radius: 1rem;
}

@media print {
    .no-print {
        visibility: hidden;
        display:none;
    }
    p{
      font-size:0.6em;
    }
}
@page {
  size: landscape;
}

/*
js deliver chart versions 
*/
</style>