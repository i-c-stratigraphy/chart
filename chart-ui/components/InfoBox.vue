<script setup lang="ts">
const props = defineProps<{
    node: chartNode,
    lang: string
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
    (e: 'close'): void
}>()
const localLang = getLangVariant(props.node, props.lang)
const prefLabel = props.node.prefLabel['@value']
const rankSplit = (props.node.rank + '').split("/")
const rank = rankSplit[rankSplit.length - 1] || "Age"
const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
});
</script>
<template>
    <div class="info-box">

        <div class="info-header" :style="`
           --_bg-color:${node.color};
            --_fg-color:${contrastColor(hexToRgb(node.color)!)};
    `">
            <span class="pref-label">{{ prefLabel }}</span>
            <span v-if="localLang != prefLabel">{{ localLang }}</span>
            <button @click="emit('close')">Close</button>
        </div>
        <div class="definition">
            <p>{{ props.node.definition }}</p>
        </div>
        <div class="details">
            <table class="table-details">
                <tr>
                    <th>Derived from</th>
                    <td><a :href="props.node.wasDerivedFrom" target="_blank">{{ props.node.wasDerivedFrom }}</a></td>
                </tr>
                <tr v-if="props.node.broader">
                    <th>Broader Scope</th>
                    <!-- <td @click="emit('view', props.node.broader[0])">{{ props.node.broader[0].replace('ischart:','') }}</td> -->
                    <td>
                        <ul>
                            <li v-for="n in props.node.broader" :key="n" @click="emit('view', n)">{{
                                n.replace('ischart:','') }} <span v-if="localLang != prefLabel">({{
                                    getLangVariantById(n,props.lang) }})</span></li>
                        </ul>
                    </td>

                </tr>
                <tr v-if="props.node.narrower">
                    <th>Narrower Scopes</th>
                    <td>
                        <ul>
                            <li v-for="n in props.node.narrower" :key="n.id" @click="emit('view', n.id)">{{
                                n.prefLabel['@value'] }} <span v-if="localLang != prefLabel">({{
                                    getLangVariant(n,props.lang) }})</span></li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <th>Geological Type</th>
                    <td>{{ rank }}</td>
                </tr>
                <tr v-if="props.node.ratifiedGSSP">
                    <th>
                        <GSSPGoldenSpike />Global Boundry Stratotype Section and Points
                    </th>
                    <td>{{ props.node.ratifiedGSSP }}</td>
                </tr>
                <tr v-if="props.node.ratifiedGSSA">
                    <th>
                        <GSSAClock />Global Standard Stratigraphic Ages
                    </th>
                    <td>{{ props.node.ratifiedGSSA }}</td>
                </tr>
                <tr>
                    <th>Alternate Labels</th>
                    <td>
                        <div class="lang-table">
                        <table>
                            <tr v-for="al in props.node.altLabel" :key="al['@language']">
                                <td>{{ languageNames.of(al['@language']) }} ({{ new
                                    Intl.DisplayNames([al['@language']], { type: 'language' }).of(al['@language']) }})
                                </td>
                                <td>{{ al['@value'] }}</td>
                            </tr>
                        </table>
                    </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
<style scoped>
.info-box {
    display: flex;
    flex-direction: column;
    overflow-y: auto;

}

.info-header {
    background-color: var(--_bg-color);
    color: var(--_fg-color, black);
    padding: 0.25rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative
}

button {
    position: absolute;
    right: 10px;
}

.definition {
    padding: 0.75rem;
}

.pref-label {
    font-weight: bold;
    font-size: 1.1em
}
.details{
    overflow-y: auto;
}
.lang-table{
    max-height:10rem;
    overflow-y: auto;
}
table {
    border-collapse: collapse;
}

tr {
    border-bottom: darkgrey 1px solid;
}

td,
th {
    padding: 0.5rem;
}

li {
    cursor: pointer;
}
</style>