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

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Executive", href: "/executive" },
    { label: "Subcommissions", href: "/subcommissions" },
    { label: "Supplementary Chart Info", href: "/supplementary" },
    { label: "GSSPs", href: "gssps" },
    { label: "Stratigraphic Guide", href: "guide" },
    { label: "Statutes & Guidelines", href: "/statuses" },
    { label: "Publications", href: "/publications" },
]
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
    <div class="widther">
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
        <nav class="nav">
            <a v-for="navLink in navLinks" :key="navLink.href" :href="navLink.href">{{ navLink.label }}</a>
        </nav>
        <div class="page-info">

            <h1>Chronostratigraphic Chart</h1>
            <p>
                This page contains the latest version of the Chronostratigraphic Chart (v2024-11) which visually
                presents
                the time periods and stratigraphic
                layers of Earth's geological history. It is available in multiple languages.</p>
            <p>
                If you are looking for older versions or other supporting material, please see the <a
                    href="/supplimentary">Supplementary Chart
                    Information</a> page.
            </p>
        </div>
        <!-- <div class="alert-alpha no-print">
            <p>This is an early access version of a Stratigraphic Chart derived from data in the triple store</p>
        </div> -->
    </div>
</template>

<style scoped>
.alert-alpha {
    padding: 0.5rem 1rem;
    border: 1px black solid;
    border-radius: 1rem;
}

nav {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
}

nav>a {
    display: block;
    /* outline:magenta 1px solid; */
    padding: 0.5rem;
    border: transparent 1px solid;
    border-bottom-width: 2px;
}

nav>a:hover {
    text-decoration: none;
    border-bottom: #095197 2px solid
}

.page-info{
    padding:1rem;
}
.page-info>h1{
    text-align: center;
}

@print {
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