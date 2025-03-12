<script setup lang="ts">
import { type Hierarchy, getLangVarientFromHierarchy } from '~/utils/util';
const props = defineProps<{
    node: chartNode,
    lang: string,
    hierarchy:Hierarchy
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
    (e: 'close'): void
}>()
const localLang = getLangVariant(props.node, props.lang)
const prefLabel = props.node.prefLabel.value
const rankSplit = (props.node.rank + '').split("/")
const rank = rankSplit[rankSplit.length - 1] || "Age"
const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
});
const NodeId = props.node["id"]
</script>
<template>
    <div class="info-box">

        <div class="info-header" :style="`
           --_bg-color:${node.color};
            --_fg-color:${contrastColor(hexToRgb(node.color)!)};
    `">
            <!-- <span class="pref-label">{{ prefLabel }}</span> -->
            <span class="pref-label">{{ localLang }}</span>
            <button @click="emit('close')">Close</button>
            <GSSPGoldenSpike  v-if="props.node.ratifiedGSSP " class="icon"/>
            <GSSAClock  v-if="props.node.ratifiedGSSA " class="icon"/>
        </div>
        <div class="definition">
            <p>{{ props.node.definition }}</p>
        </div>
        <div class="details">
            <table class="table-details">

                <tr v-if="props.hierarchy[NodeId].broader">
                    <th>Within</th>
                   
                    <!-- <td @click="emit('view', props.node.broader[0])">{{ props.node.broader[0].replace('ischart:','') }}</td> -->
                    <td>
                        <ul v-if= props.hierarchy[NodeId].broader class="linked-periods">

                            <li  @click="emit('view', props.hierarchy[NodeId].broader?.id!)">
                                {{ getLangVarientFromHierarchy(props.hierarchy[NodeId].broader!, props.lang) }}
                            </li>
                        </ul>
                    </td>

                </tr>
                <tr v-if="props.hierarchy[NodeId].narrower">
                    <th>Contains</th>
                    <td>
                        <ul class="linked-periods" v-if="props.hierarchy[NodeId].narrower">
                            <li v-for="n in props.hierarchy[NodeId].narrower" :key="n.id" @click="emit('view', n.id)" >
                                {{ getLangVarientFromHierarchy(n, props.lang)  }}
                            </li>
                        </ul>
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
.linked-periods{
    list-style-image: none;
    list-style-type:none;
    cursor: pointer;
    color: #0000EE; 
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
.icon{
    position: absolute;
    left: 10px;
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
    width:100%;
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
.details{
    list-style: none;
}
.detials li{
    text-decoration: underline;
}
</style>