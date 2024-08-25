<script setup>
import jsonRawData from "@/assets/chart.json";
import gsspIcon from "@/assets/gssp-golden-spike.svg";
import gssaIcon from "@/assets/gssa-clock.svg";
const selectedLang = ref("en");
// type chartNode = {
//     narrower?: chartNode[]
//     [key:string]:any
// }
// type root = {
//     hasTopConcept?: chartNode[]
//     [key:string]:any

// }
const rawData = jsonRawData
// type labelStruct = {
//     "@language":string 
//     "@value": string 
// }
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}
function sortedNode(node) {
    return node.narrower?.sort((a, b) => parseInt(a.order['@value']) > parseInt(b.order['@value']))
}
function getLangVariant(node) {
    if (Array.isArray(node.altLabel)) {
        const alt = node.altLabel.filter(x => x["@language"] == selectedLang.value)
        if (alt.length == 1) {
            console.log(alt[0]["@value"])
            return alt[0]["@value"]
        }
    }
    return node.prefLabel["@value"]

}

const flattenLangs = (acc, cur) => {
    if (cur.narrower) {
        cur.narrower.reduce(flattenLangs, acc)
    }
    if (Array.isArray(cur.altLabel)) {
        acc.push([cur.prefLabel, ...cur.altLabel])
    } else {
        acc.push([cur.prefLabel, cur.altLabel])
    }

    return acc
}


const langs = rawData.hasTopConcept.reduce(flattenLangs, []).flat().filter(x => x != undefined).map(x => x["@language"]).filter(onlyUnique)

const data = rawData

// type ldItem = {
//     narrower?: ldItem
//     [key: string]: any
// }
// const getTotalChildrenCount = (data: ldItem, num: number): number => {
//     if (data.narrower && data.narrower.length) {
//         let len = data.narrower.length;
//         num += len;
//         for (let i = 0; i < len; i++) {
//             console.log(data.narrower[i].prefLabel['@value'])
//             console.log(num)
//             getTotalChildrenCount(data.narrower[i], num);
//         }
//         // return num//num
//     }
//     return 0;
// }

const getRootTotal = () => {
    var total = 0
    // getTotalChildrenCount(data.hasTopConcept[0].narrower[0], total) //+ getTotalChildrenCount(data.hasTopConcept[1], total)
    return total
}
</script>
<template>
    <h1>chart</h1>
    <select v-model="selectedLang">
        <option v-for="lang in langs" :value="lang">{{ lang }}</option>
    </select>


    <table>
        <tr v-for="n0 in data.hasTopConcept">
            <td :style="` background-color: ${n0.color}`">{{ getLangVariant(n0) }}</td>
            <td>
                <table v-for="n1 in sortedNode(n0)">
                    <tr>
                        <td :style="` background-color: ${n1.color}`">{{ getLangVariant(n1) }}
                            <template v-if="!n1.narrower">
                                <div class="gss-icon" v-if="n1.ratifiedGSSA"><img :src="gssaIcon" /></div>
                                <div class="gss-icon" v-if="n1.ratifiedGSSP"><img :src="gsspIcon" /></div>
                            </template>
                        </td>
                        <td>
                            <table v-for="n2 in sortedNode(n1)">
                                <tr>
                                    <td :style="` background-color: ${n2.color}`">{{ getLangVariant(n2) }}
                                        <template v-if="!n2.narrower">
                                            <div class="gss-icon" v-if="n2.ratifiedGSSA"><img :src="gssaIcon" /></div>
                                            <div class="gss-icon" v-if="n2.ratifiedGSSP"><img :src="gsspIcon" /></div>
                                        </template>

                                    </td>
                                    <td>
                                        <table v-for="n3 in sortedNode(n2)">
                                            <tr>
                                                <td :style="` background-color: ${n3.color}`"
                                                    :data-hasGSSA="n3.ratifiedGSSA">{{
                                                        getLangVariant(n3) }}
                                                    <template v-if="!n3.narrower">
                                                        <div class="gss-icon" v-if="n3.ratifiedGSSA"><img
                                                                :src="gssaIcon" /></div>
                                                        <div class="gss-icon" v-if="n3.ratifiedGSSP"><img
                                                                :src="gsspIcon" /></div>
                                                    </template>
                                                </td>
                                                <td>
                                                    <table v-for="n4 in sortedNode(n3)">
                                                        <!--  -->
                                                        <tr>
                                                            <td :style="`display:relativ; height: ${n4.hasBeginning.inMYA['@value'] - n4.hasEnd.inMYA['@value']}px;line-height: max(1rem, ${(n4.hasBeginning.inMYA['@value'] - n4.hasEnd.inMYA['@value']) * 10}px); background-color: ${n4.color}`"
                                                                :data-height="parseInt(n4.hasBeginning.inMYA['@value']) - parseInt(n4.hasEnd.inMYA['@value'])"
                                                                :data-hasGSSP="n4.ratifiedGSSP" :data-color="n4.color"
                                                                :data-hasGSSA="n4.ratifiedGSSA">
                                                                {{ getLangVariant(n4) }}
                                                                <template v-if="!n4.narrower">
                                                                    <div class="gss-icon" v-if="n4.ratifiedGSSA"><img
                                                                            :src="gssaIcon" /></div>
                                                                    <div class="gss-icon" v-if="n4.ratifiedGSSP"><img
                                                                            :src="gsspIcon" /></div>
                                                                </template>
                                                            </td>
                                                            <td v-if="n4.narrower">
                                                                <table v-for="n5 in sortedNode(n4)">
                                                                    <!--  -->
                                                                    <tr>
                                                                        <td :style="`display:relativ; height: ${n5.hasBeginning.inMYA['@value'] - n5.hasEnd.inMYA['@value']}px;line-height: max(1rem, ${(n5.hasBeginning.inMYA['@value'] - n5.hasEnd.inMYA['@value']) * 10}px); background-color: ${n5.color}`"
                                                                            :data-height="parseInt(n5.hasBeginning.inMYA['@value']) - parseInt(n5.hasEnd.inMYA['@value'])"
                                                                            :data-hasGSSP="n5.ratifiedGSSP"
                                                                            :data-color="n5.color"
                                                                            :data-hasGSSA="n5.ratifiedGSSA">
                                                                            {{ getLangVariant(n5) }}
                                                                            <template v-if="!n5.narrower">
                                                                                <div class="gss-icon"
                                                                                    v-if="n5.ratifiedGSSA"><img
                                                                                        :src="gssaIcon" /></div>
                                                                                <div class="gss-icon"
                                                                                    v-if="n5.ratifiedGSSP"><img
                                                                                        :src="gsspIcon" /></div>
                                                                            </template>
                                                                        </td>

                                                                        <td class="age">
                                                                            {{ n5.hasBeginning?.["skos:note"] ===
                                                                                "uncertain" ||
                                                                                n5.hasEnd?.["skos:note"]
                                                                            === "uncertain" ? "~" : '' }}
                                                                            {{ n5.hasEnd.inMYA["@value"] == 0 ?
                                                                                'Present' :
                                                                            `${n5.hasEnd.inMYA["@value"]}` }}
                                                                            {{ n5.hasEnd.marginOfError ? `&mnplus;
                                                                            ${n5.hasEnd.marginOfError["@value"]}` : ''
                                                                            }}
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td v-else class="age">
                                                                {{ n4.hasBeginning?.["skos:note"] === "uncertain" ||
                                                                    n4.hasEnd?.["skos:note"] ===
                                                                    "uncertain" ? "~" : '' }}
                                                                {{ n4.hasEnd.inMYA["@value"] == 0 ? 'Present' :
                                                                    `${n4.hasEnd.inMYA["@value"]}` }}
                                                                {{ n4.hasEnd.marginOfError ? `&mnplus;
                                                                ${n4.hasEnd.marginOfError["@value"]}` : '' }}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!-- <ul class="chart" :data-lang="selectedLang" v-show="false">
       
        <li>
            <span class="vlabel">{{ getLangVariant(data.hasTopConcept[0]) }}</span>
            <ul>
                <li v-for="n1 in data.hasTopConcept[0].narrower">
                    <span class="vlabel">{{ getLangVariant(n1) }}</span>
                    <ul>
                        <li v-for="n2 in n1.narrower">
                            <span class="vlabel">{{ getLangVariant(n2) }}</span>
                            <ul v-if="n2.narrower">
                                <li v-for="n3 in n2.narrower">
                                    <span class="hlabel wide">{{ getLangVariant(n3) }}</span>
                                    <ul v-if="n3.narrower">
                                        <li v-for="n4 in n3.narrower">
                                            <span class="hlabel">{{ getLangVariant(n4) }}</span>
                                            <span class="gssp">{{ n4.ratifiedGSSP === "true" ? 'G' : '' }}</span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>

        </li>
        <li>
            <span class="vlabel">{{ getLangVariant(data.hasTopConcept[1]) }}</span>
            <ul>
                <li v-for="n1 in data.hasTopConcept[1].narrower">
                    <span :class="n1.narrower ? 'vlabel' : 'hlabel'">{{ getLangVariant(n1) }}</span>
                    <ul>
                        <li v-for="n2 in n1.narrower">
                            <span class="hlabel">{{ getLangVariant(n2) }}</span>
                            <ul v-if="n2.narrower">
                                <li v-for="n3 in n2.narrower">
                                    <span class="hlabel">{{ getLangVariant(n3) }}</span>
                                    <span class="gssp">{{ n3.ratifiedGSSP === "true" ? 'G' : '' }}</span>
                                 
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>

        </li>
    </ul> -->
    <pre v-show="false">
    {{ JSON.stringify(data, undefined, 2) }}
</pre>
</template>
<style>
body{
    print-color-adjust:exact;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style scoped>
table,
tr,
td {
    border: 1px black solid;
    outline: 1px black solid;
    border: none;
    border-collapse: collapse;
    align-items: start;
    margin: 0px;
    padding: 0px;

}

td:first-child {
    width: 200px;
}

td.age {
    width: 100px;
    text-align: center;
}

td:last-child {
    /* width: 400px; */
}

td {
    --_bg-color: attr(data-color);
    justify-items: start;
    min-height: 1rem !important;
    position: relative;
    background-color: var(--_bg-color, #ff00ff);
}

/* td[data-hasGSSP="true"]::after{
position:absolute;
content:'G';
bottom:0;
right:0;
color:cornflowerblue
}
td[data-hasGSSA="true"]::after{
position:absolute;
content:'A';
bottom:0;
right:0;
color:goldenrod
} */

.chart {
    width: 600px
}

.chart>li {
    border: black solid 1px;
    position: relative;
    list-style: none;
    /* padding:0px; */

}

.chart .vlabel {
    position: absolute;
    display: inline-block;
    transform-origin: 0 0;
    transform: rotate(-90deg) translateX(-100%);
}

.chart .hlabel {
    position: absolute;
    display: inline-block;

    /* transform: translateX(-100%); */
}

li:has(.vlabel) {
    display: block;
    min-height: 1rem;
    /* width:4rem; */
    outline: red solid 2px
}

li:has(.hlabel) {
    display: block;
    min-height: 1rem;
    min-width: 250px;
}

.gss-icon {
    position: absolute;

    bottom: 2px;
    right: 2px
}

.chart ul {
    outline: magenta 1px solid;
    padding-left: 6rem;
    list-style: none;
    position: relative
}

.chart ul:has(.vlabel) {
    padding-left: 3rem
}

.chart li {
    position: relative;
    outline: lime solid 1px;
    min-height: 2rem;
}

ul:has(.wide) {
    min-width: 8rem;
}
</style>