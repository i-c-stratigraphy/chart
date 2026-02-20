<script setup lang="ts">
import { computed } from 'vue';
import { type chartNode } from '~/utils/util';
import { useLabelContext } from '~/utils/label';

const props = defineProps<{
    node: chartNode,
    lang: string,
}>()
const emit = defineEmits<{
    (e: 'view', node: string): void
    (e: 'close'): void
}>()

const { getLabel, getDefinition } = useLabelContext()

const label = computed(() => {
    return getLabel(props.node.id)
})

const definition = computed(() => {
    return getDefinition(props.node.id) || props.node.definition
})
</script>
<template>
    <div class="info-box">

        <div class="info-header" :style="`
           --_bg-color:${node.color};
            --_fg-color:${contrastColor(hexToRgb(node.color)!)};
    `">
            <span class="pref-label">{{ label }}</span>
            <button @click="emit('close')">Close</button>
            <GSSPGoldenSpike  v-if="props.node.ratifiedGSSP " class="icon"/>
            <GSSAClock  v-if="props.node.ratifiedGSSA " class="icon"/>
        </div>
        <div class="definition">
            <p>{{ definition }}</p>
        </div>
        <div class="details">
            <table class="table-details">

                <tr v-if="props.node.broader && props.node.broader.length > 0">
                    <th>Within</th>
                    <td>
                        <ul class="linked-periods">
                            <li v-for="b in props.node.broader" :key="b" @click="emit('view', b)">
                                {{ getLabel(b) }}
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr v-if="props.node.narrower && props.node.narrower.length > 0">
                    <th>Contains</th>
                    <td>
                        <ul class="linked-periods">
                            <li v-for="n in props.node.narrower" :key="n.id" @click="emit('view', n.id)" >
                                {{ getLabel(n.id) }}
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
