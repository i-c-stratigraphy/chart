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
console.log("PASS: chart roots, child units, numeric ages and version metadata match the application.");
