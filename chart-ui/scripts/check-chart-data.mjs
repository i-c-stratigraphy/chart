import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Parser, Store, DataFactory } from "n3";

const { namedNode } = DataFactory;
const store = new Store(new Parser().parse(readFileSync(new URL("../../chart.ttl", import.meta.url), "utf8")));
const layout = readFileSync(new URL("../utils/layout.ts", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/DynamicChart.vue", import.meta.url), "utf8");
const namespace = layout.match(/ischart:\s*'([^']+)'/)[1];
const scheme = component.match(/cs:\s*"([^"]+)"/)[1];
const skos = "http://www.w3.org/2004/02/skos/core#";
const time = "http://www.w3.org/2006/time#";
for (const name of ["Phanerozoic", "Precambrian", "Quaternary", "Jurassic"]) {
  const node = namedNode(namespace + name);
  assert(store.countQuads(node, namedNode(skos + "narrower"), null, null) > 0,
    name + " has no children using the UI namespace");
  const beginning = store.getObjects(node, namedNode(time + "hasBeginning"), null)[0];
  assert(beginning && store.countQuads(beginning, namedNode(namespace + "inMYA"), null, null) > 0,
    name + " has no numeric beginning");
}
assert(store.countQuads(namedNode(scheme), namedNode("http://www.w3.org/2002/07/owl#versionInfo"), null, null) > 0,
  "Chart metadata does not match the UI namespace");
const prefLabel = namedNode(skos + "prefLabel");
const title = namedNode("https://data.stratigraphy.org/data/vis/ChartTitle");
const creator = store.getObjects(namedNode(scheme), namedNode("http://purl.org/dc/terms/creator"), null)[0];
assert(creator, "Chart creator is missing");
const names = store.getObjects(creator, namedNode("https://schema.org/alternateName"), null);
for (const label of store.getObjects(title, prefLabel, null)) {
  assert(store.countQuads(namedNode(scheme), prefLabel, label, null) > 0,
    "Chart scheme title is missing for " + label.language);
  assert(names.some(name => name.language === label.language && name.value),
    "Translated creator name is missing for " + label.language);
}
for (const lang of ["en", "pt-pt"]) {
  assert(store.getObjects(title, prefLabel, null).some(label => label.language === lang && label.value),
    "Chart title is missing for " + lang);
}
assert.equal(store.countQuads(namedNode("http://purl.org/dc/terms/created"), prefLabel, null, null), 0,
  "Organisation labels still use the old dcterms:created resource");
console.log("PASS: chart structure, version, translated titles and creator names match the application.");
