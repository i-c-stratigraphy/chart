import { provide, type Ref, inject } from "vue";
import n3 from "n3";
import type { AnyPointer } from "clownface";

const NS = {
  skos: "http://www.w3.org/2004/02/skos/core#",
  strat: "http://resource.geosciml.org/ontology/stratigraphy/",
  ischart: "http://resource.geosciml.org/classifier/ics/ischart/",
};

const { namedNode } = n3.DataFactory;

const labelContextKey = Symbol("LabelContext");

export type LabelType = "stratigraphic" | "timescale";

type GetLabelFunction = (
  iri: string,
  type?: LabelType,
  language?: string
) => string;

type GetDefinitionFunction = (
  iri: string,
  language?: string
) => string | undefined;

export function createLabelProvider(
  cf: Ref<AnyPointer | null>,
  currentLang: Ref<string>,
  currentLabelType: Ref<LabelType>
) {
  function getDirectLabel(iri: string, lang: string): string | undefined {
    if (!cf.value) return undefined;
    const node = cf.value.node(namedNode(iri));
    
    // Try preferred label in target language
    const pref = node.out(namedNode(NS.skos + "prefLabel"))
      .terms.find(t => t.termType === "Literal" && t.language === lang)?.value;
    if (pref) return pref;

    // Try alt label in target language
    const alt = node.out(namedNode(NS.skos + "altLabel"))
      .terms.find(t => t.termType === "Literal" && t.language === lang)?.value;
    if (alt) return alt;

    // Fallback to English
    if (lang !== "en") {
      return getDirectLabel(iri, "en");
    }

    return undefined;
  }

  function getDefinition(iri: string, lang?: string): string | undefined {
    if (!cf.value) return undefined;
    const language = lang || currentLang.value;
    const node = cf.value.node(namedNode(iri));
    
    const def = node.out(namedNode(NS.skos + "definition"))
      .terms.find(t => t.termType === "Literal" && t.language === language)?.value;
    
    if (def) return def;

    // Fallback to English
    if (language !== "en") {
      return getDefinition(iri, "en");
    }

    return undefined;
  }

  function resolveLabel(iri: string, type: LabelType, lang: string): string {
    const direct = getDirectLabel(iri, lang);
    if (direct) return direct;

    // Synthesis logic
    const localName = iri.split("/").pop() || "";

    // Cambrian special cases
    if (localName.includes("Cambrian")) {
      const cambrianLabel = getDirectLabel(NS.ischart + "Cambrian", lang) || "Cambrian";
      const isSeries = localName.includes("Series");
      const rankLabel = getDirectLabel(NS.strat + (isSeries ? "Series" : "Stage"), lang) || (isSeries ? "Series" : "Stage");
      const numMatch = localName.match(/\d+/);
      const num = numMatch ? numMatch[0] : "";
      return `${cambrianLabel} ${rankLabel} ${num}`.trim();
    }

    // Upper/Middle/Lower synthesis
    const agesStages = ["Upper", "Middle", "Lower"];
    for (const adj of agesStages) {
      if (localName.startsWith(adj)) {
        let uml = adj;
        if (type === "timescale") {
          if (adj === "Upper") uml = "Late";
          else if (adj === "Lower") uml = "Early";
        }
        
        const adjLabel = getDirectLabel(NS.strat + uml, lang) || uml;
        const baseName = localName.substring(adj.length);
        const baseIri = NS.ischart + baseName;
        const baseLabel = getDirectLabel(baseIri, lang) || baseName;
        
        return `${adjLabel} ${baseLabel}`;
      }
    }

    return localName; // Final fallback
  }

  const getLabel: GetLabelFunction = (iri, type, lang) => {
    return resolveLabel(iri, type || currentLabelType.value, lang || currentLang.value);
  };

  provide(labelContextKey, {
    getLabel,
    getDefinition,
  });

  return {
    getLabel,
    getDefinition,
  };
}

export function useLabelContext() {
  const context = inject<{
    getLabel: GetLabelFunction;
    getDefinition: GetDefinitionFunction;
  }>(labelContextKey);
  if (!context) throw new Error("Label context not found");
  return context;
}
