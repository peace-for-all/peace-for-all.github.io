export const EVIDENCE = {
  order_record: {
    label: "order record",
    fact: "The customer had already placed an order and was waiting for delivery.",
  },
  incident_log: {
    label: "incident log",
    fact: "A fulfilment outage overlapped the order's expected journey.",
  },
  support_chat: {
    label: "support chat",
    fact: "The customer had asked support for help and received no response before posting publicly.",
  },
};

export const INTERPRETATIONS = ["pre_purchase_availability", "unfulfilled_order", "insufficient_context"];

export function normalizeSources(sources) {
  return [...new Set(sources)].filter(source => Object.hasOwn(EVIDENCE, source));
}

export function evaluateAssessment({ interpretation, rationale = "", revealedSources = [] }) {
  if (!INTERPRETATIONS.includes(interpretation)) throw new TypeError(`Unknown interpretation: ${interpretation}`);
  const sources = normalizeSources(revealedSources);
  const complete = Object.keys(EVIDENCE).every(source => sources.includes(source));
  let status = "honest_abstention";
  let feedback = "There is not enough connected context yet. Keeping the situation unresolved is safer than completing the story from its wording.";

  if (interpretation === "pre_purchase_availability") {
    status = sources.length ? "contradicted_by_evidence" : "surface_only";
    feedback = sources.length
      ? "The connected evidence contradicts the tempting stock-question template."
      : "Plausible from the sentence alone, but not yet supported by customer-journey evidence.";
  } else if (interpretation === "unfulfilled_order") {
    status = complete ? "supported" : "premature";
    feedback = complete
      ? "Supported: this is an unfulfilled-order escalation expressed through a marketplace availability question."
      : "Possible, but still premature. Inspect the remaining sources before treating it as fact.";
  }

  return { interpretation, rationale: String(rationale).trim(), revealedSources: sources, evidenceComplete: complete, status, feedback };
}

export function createSupportCaseToolDefinitions({ revealEvidence, submitAssessment }) {
  return [
    {
      name: "inspect_customer_case_evidence",
      description: "Inspect one connected source for the visible anonymized marketplace message and reveal it on the page for the person to review.",
      inputSchema: {
        type: "object",
        properties: {
          source: {
            type: "string",
            description: "The customer-journey evidence source to inspect.",
            enum: Object.keys(EVIDENCE),
          },
        },
        required: ["source"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async ({ source }) => {
        if (!Object.hasOwn(EVIDENCE, source)) throw new TypeError(`Unknown evidence source: ${source}`);
        return revealEvidence(source);
      },
    },
    {
      name: "assess_customer_case",
      description: "Place an evidence-aware interpretation of the visible anonymized customer case on the page. This is an assessment only and cannot send a response or authorize an action.",
      inputSchema: {
        type: "object",
        properties: {
          interpretation: {
            type: "string",
            enum: INTERPRETATIONS,
            description: "The best-supported interpretation, including an explicit insufficient-context option.",
          },
          rationale: {
            type: "string",
            description: "A brief explanation grounded only in evidence revealed on the page.",
            minLength: 1,
            maxLength: 240,
          },
        },
        required: ["interpretation", "rationale"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async input => submitAssessment(input),
    },
  ];
}
