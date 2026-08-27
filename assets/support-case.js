import { EVIDENCE, createSupportCaseToolDefinitions, evaluateAssessment, normalizeSources } from "./support-case-core.js";

const revealed = new Set();

function updateEvidence(source) {
  const evidence = EVIDENCE[source];
  if (!evidence) throw new TypeError(`Unknown evidence source: ${source}`);
  revealed.add(source);
  const item = document.querySelector(`[data-evidence="${source}"]`);
  if (item) {
    item.hidden = false;
    item.scrollIntoView({ block: "nearest" });
  }
  const button = document.querySelector(`[data-reveal-evidence="${source}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = `${evidence.label} inspected`;
  }
  const status = document.querySelector("#case-status");
  if (status) status.textContent = `${revealed.size}/3 connected sources inspected.`;
  return {
    source,
    fact: evidence.fact,
    revealedSources: normalizeSources([...revealed]),
    remainingSources: Object.keys(EVIDENCE).filter(key => !revealed.has(key)),
    note: "This evidence was also revealed in the shared page.",
  };
}

function showAssessment(input) {
  const result = evaluateAssessment({ ...input, revealedSources: [...revealed] });
  const panel = document.querySelector("#case-assessment");
  const verdict = document.querySelector("#assessment-verdict");
  const rationale = document.querySelector("#assessment-rationale");
  if (panel && verdict && rationale) {
    panel.hidden = false;
    panel.dataset.status = result.status;
    verdict.textContent = result.feedback;
    rationale.textContent = result.rationale ? `Agent reasoning: ${result.rationale}` : "";
    panel.scrollIntoView({ block: "nearest" });
  }
  return { ...result, note: "The assessment is visible on the shared page. It does not authorize or send a customer response." };
}

document.querySelectorAll("[data-reveal-evidence]").forEach(button => {
  button.addEventListener("click", () => updateEvidence(button.dataset.revealEvidence));
});

async function registerSiteTools() {
  if (typeof document.modelContext?.registerTool !== "function") return;
  const tools = createSupportCaseToolDefinitions({ revealEvidence: updateEvidence, submitAssessment: showAssessment });
  for (const tool of tools) await document.modelContext.registerTool(tool);
}

registerSiteTools().catch(error => console.warn("Customer-case site tools were unavailable.", error));
