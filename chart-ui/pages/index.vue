<template>
    <StratigraphyHeader class="no-print" />
    <DynamicChart />
    <div class="widther no-print">
        <footer>
            © 2013-2025 International Commission on Stratigraphy, all rights reserved
        </footer>
    </div>
</template>
<style>
html,
body {
    padding: 0px;
    margin: 0px;
    background-color: #e0dedf
}

@font-face {
    font-family: 'Palatino';
    src: url('/style/Palatino.eot?#iefix') format('embedded-opentype'), url('/style/Palatino.woff') format('woff'), url('/style/Palatino.ttf') format('truetype'), url('/style/Palatino.svg#Palatino') format('svg');
    font-weight: normal;
    font-style: normal;
}

body {
    text-align: center;
    line-height: 1.5em;
    background-size: 100%;
    background-color: #e0dedf;
    font-family: arial, helvetica, sans-serif;
}
.widther {
    margin: 0 auto;
    max-width: 1000px;
    text-align: left;
    box-shadow: 0pt 0pt 3px rgb(136, 136, 136);
    background-color: white;
}

footer {
    font-size: small;
    background: #333333;
    color: white;
    text-align: center;
    padding: 25px;
}
@media print{
    body{background-color: white}
}
</style>