import { computed, provide, type Ref, inject } from "vue";
import type { NamedNode } from "@rdfjs/types";
import n3 from "n3";
import clownface from "clownface";
import $rdf from "rdf-ext";

const sdo = $rdf.namespace("https://schema.org/");
const skos = $rdf.namespace("http://www.w3.org/2004/02/skos/core#");
const skosxl = $rdf.namespace("http://www.w3.org/2008/05/skos-xl#");

const { literal } = n3.DataFactory;

const labelContextKey = Symbol("LabelContext");
const shortform = literal("shortform");
const longform = literal("longform");
const defaultLanguage = literal("default");

type GetLabelFunction = (
  iri: NamedNode,
  formType?: "shortform" | "longform",
  useDefaultLanguage?: boolean
) => string | undefined;

export function createLabelProvider(
  data: Ref<string>[],
  lang: Ref<string>,
  selectedLabelType: Ref<"stratigraphic" | "timescale">
) {
  const parser = new n3.Parser({ format: "text/turtle" });
  const langLiteral = computed(() =>
    lang.value === "en" ? defaultLanguage : literal(lang.value)
  );
  const pointer = computed(() => {
    const quads = [];
    for (const d of data) {
      quads.push(...parser.parse(d.value));
    }
    const store = new n3.Store(quads);
    return clownface({ dataset: store });
  });

  /**
   * Get a label for a given IRI.
   *
   * This functions tries to retrieve a SKOS-XL label in the selected language.
   * If this fails, it tries to retrieve a normal SKOS literal label in the
   * selected language. If this also fails, it tries to retrieve the SKOS-XL
   * label in the default language. If this also fails, it returns 'Label not found'.
   *
   * @param iri - The IRI to get a label for
   * @param formType - SKOS-XL label form (shortform or longform)
   * @param useDefaultLanguage - Whether to use the default language
   * @returns The label for the given IRI
   */
  function getLabel(
    iri: NamedNode,
    formType: "shortform" | "longform" = "shortform",
    useDefaultLanguage: boolean = false
  ): string {
    const resource = pointer.value.node(iri);

    let formTypeLiteral = shortform;
    if (formType === "longform") {
      formTypeLiteral = longform;
    }

    if (!useDefaultLanguage) {
      const skosxlLabel = resource
        .out(skosxl.prefLabel)
        .has(sdo.inLanguage, langLiteral.value)
        .has(sdo.keywords, formTypeLiteral)
        .has(sdo.keywords, literal(selectedLabelType.value))
        .out(skosxl.literalForm);

      if (skosxlLabel.term?.value) {
        return skosxlLabel.term.value;
      }

      const skosLiteralLabel = resource
        .out(lang.value === "en" ? skos.prefLabel : skos.altLabel)
        .terms.filter(
          (term) => term.termType === "Literal" && term.language === lang.value
        );

      if (skosLiteralLabel.length > 0) {
        return skosLiteralLabel[0].value;
      }
    }

    const skosxlDefaultLabel = resource
      .out(skosxl.prefLabel)
      .has(sdo.inLanguage, defaultLanguage)
      .has(sdo.keywords, formTypeLiteral)
      .has(sdo.keywords, literal(selectedLabelType.value))
      .out(skosxl.literalForm);

    return skosxlDefaultLabel.term?.value ?? "Label not found";
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
