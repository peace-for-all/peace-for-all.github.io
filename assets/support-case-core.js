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

export function fieldNote(sources) {
  const revealed = normalizeSources(sources);
  if (revealed.length === 3) return "Three systems later, the six-word question has acquired a plot.";
  if (revealed.length === 1 && revealed[0] === "incident_log") return "Good instinct. Incidents are context, though—not yet a verdict.";
  if (revealed.length === 1 && revealed[0] === "support_chat") return "A public question after a silent private channel is rarely just a product question.";
  if (revealed.length === 2 && !revealed.includes("order_record")) return "We have a failure and an escalation, but not yet the object connecting them.";
  return "";
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

  const note = status === "contradicted_by_evidence"
    ? "The template is fluent. Unfortunately, reality has filed an objection."
    : status === "honest_abstention"
      ? "Abstention accepted. The machine survives not knowing something."
      : status === "supported"
        ? "Case closed. No customer response was harmed in the making of this assessment."
        : "";
  return { interpretation, rationale: String(rationale).trim(), revealedSources: sources, evidenceComplete: complete, status, feedback, note };
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
