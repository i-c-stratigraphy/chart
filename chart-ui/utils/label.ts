import { computed, provide, type Ref, inject } from "vue";
import type { NamedNode } from "@rdfjs/types";
import n3 from "n3";
import clownface from "clownface";
import $rdf from "rdf-ext";

const sdo = $rdf.namespace("https://schema.org/");
const skosxl = $rdf.namespace("http://www.w3.org/2008/05/skos-xl#");

const { literal } = n3.DataFactory;

const labelContextKey = Symbol("LabelContext");
const shortform = literal("shortform");
const longform = literal("longform");
const defaultLanguage = literal("default");

type GetLabelFunction = (
  iri: NamedNode,
  formType?: "shortform" | "longform",
  defaultLang?: boolean
) => string | undefined;

export function createLabelProvider(
  data: Ref<string>,
  lang: Ref<string>,
  selectedLabelType: Ref<"stratigraphic" | "timescale">
) {
  const parser = new n3.Parser({ format: "text/turtle" });
  const langLiteral = computed(() =>
    lang.value === "en" ? defaultLanguage : literal(lang.value)
  );
  const pointer = computed(() => {
    const quads = parser.parse(data.value);
    const store = new n3.Store(quads);
    return clownface({ dataset: store });
  });

  function getLabel(
    iri: NamedNode,
    formType: "shortform" | "longform" = "shortform",
    defaultLang: boolean = false
  ): string | undefined {
    const resource = pointer.value.node(iri);
    let formTypeLiteral = shortform;
    if (formType === "longform") {
      formTypeLiteral = longform;
    }
    const label = resource
      .out(skosxl.prefLabel)
      .has(sdo.inLanguage, defaultLang ? defaultLanguage : langLiteral.value)
      .has(sdo.keywords, formTypeLiteral)
      .has(sdo.keywords, literal(selectedLabelType.value))
      .out(skosxl.literalForm);

    return label.term?.value;
  }

  provide(labelContextKey, {
    getLabel: getLabel as GetLabelFunction,
  });
}

export function useLabelContext() {
  const labelContext = inject<{
    getLabel: GetLabelFunction;
  }>(labelContextKey);
  if (!labelContext) {
    throw new Error("Label context not found");
  }
  return labelContext;
}
