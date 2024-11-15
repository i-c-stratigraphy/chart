<script setup lang="ts">
const imagesArray = [
    "/images/banner-01.png",
    "/images/banner-02.png",
    "/images/banner-03.png",
    "/images/banner-04.png",
    "/images/banner-05.png",
    "/images/banner-06.png",
    "/images/banner-07.png",
    "/images/banner-08.png"
];

const interval = ref()
const bgImage = ref("")
function displayImage() {
    bgImage.value = "https://stratigraphy.org" + imagesArray[Math.floor(Math.random() * (imagesArray.length - 1))]
}
onMounted(() => {
    displayImage()
    interval.value = setInterval(displayImage, 7000)
})
onUnmounted(() => {
    clearInterval(interval.value)
})
</script>
<template>
    <div id="widther">
        <div id="header">
            <div style="text-align:right;">
                <a href="https://stratigraphy.org"><img src="/logo-ics-3D-dark.png" alt="ICS logo"
                        style="width:100px" /></a>
            </div>
            <div id="innerheader">
                <div id="headertxt" style="padding: 50px 20px;">
                    <div id="title">International Commission on Stratigraphy</div>
                </div>
            </div>
        </div>
        <div id="banner" :style="`background-image: url(${bgImage})`"></div>
        <div class="alert-alpha no-print">
    <p>This is an early access version of a Stratigraphic Chart derived from data in the triple store</p>
  </div>
    </div>
</template>
<style scoped>
.alert-alpha{
  padding: 0.5rem 1rem;
  border: 1px black solid;
  border-radius: 1rem;
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
    padding: 0;
    margin: 0;
    font-family: arial, helvetica, sans-serif;
}
@print{
    body {
    text-align: center !important;
    line-height: unset !important;
    background-size: unset !important;
    background-color: white !important;

    font-family: arial, helvetica, sans-serif;
}
}

#widther {
    margin: 0 auto;
    max-width: 1000px;
    text-align: left;
    box-shadow: 0pt 0pt 3px rgb(136, 136, 136);
    background-color: white;
}


h2,
h3,
h4 {
    color: #555555;
    font-family: Arial, sans-serif;
}

h2>a {
    font-weight: normal;
}

h2>sup {
    float: right;
}

#title {
    font-size: 32px;
    font-weight: bold;
    color: blue;
    font-family: 'Palatino', sans-serif;
    margin-left: 50px;
}

h4 {
    font-weight: bold;
}

p,
li,
td,
th,
a,
.caption {
    font-family: arial, helvetica, sans-serif;
    color: #333333;
}

a {
    text-decoration: none;
    text-align: center;
    color: #095197;
}

a:hover {
    text-decoration: underline;
}

ul {
    line-height: 2em;
}

li>ul>li {
    font-size: smaller;
}

#header {
    display: grid;
    grid-template-columns: 150px 1fr;
    height: 100px;
}

#innerheader {
    display: grid;
    grid-template-rows: 50px 100px;
}

#banner {
    background: url("/images/banner-01.png") no-repeat;
    display: block;
    height: 270px;
    background-size: contain;
    margin-bottom: 30px;
}

#body-grid {
    display: grid;
    grid-template-columns: 200px 1fr;
}

#container-content {
    padding: 0 20px 0 20px;
    overflow: hidden;
}

footer {
    font-size: small;
    background: #333333;
    color: white;
    text-align: center;
    padding: 25px;
}

.person {
    font-size: smaller;
    text-align: center;
    width: 300px;
    margin: 10px 20px 10px 20px;
    float: left;
}

.person>h4 {
    margin: 0;
    line-height: 1.5em;
}

.person>p {
    margin: 0;
    line-height: 1.5em;
}

.caption {
    font-size: small;
}
</style>