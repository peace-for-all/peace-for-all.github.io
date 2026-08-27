import { createConversationToolDefinitions, defaultConversationCard, formatConversationCard, getStarter } from "./conversation-core.js";

const section = document.querySelector("#rehearse");
const scenePanel = document.querySelector("#rehearsal-scene");
const cardPanel = document.querySelector("#conversation-card");
const status = document.querySelector("#rehearsal-status");
let activeStarter = null;

function clearCardFields() {
  for (const id of ["card-curiosity", "card-question", "card-opener"]) document.querySelector(`#${id}`).value = "";
  document.querySelector("#card-evidence").textContent = "";
  const source = document.querySelector("#card-source");
  source.href = "/#projects";
  source.textContent = "Read the published connection";
}

function openIcebreaker(starter) {
  activeStarter = starter.id;
  scenePanel.hidden = false;
  cardPanel.hidden = true;
  clearCardFields();
  document.querySelector("#rehearsal-title").textContent = starter.label;
  document.querySelector("#rehearsal-example").textContent = starter.scene;
  document.querySelector("#rehearsal-question").textContent = starter.smallQuestion;
  const related = document.querySelector("#rehearsal-related");
  related.href = starter.project.url;
  related.textContent = `Show me ${starter.project.title}`;
  status.textContent = "A tiny example is open. No problem statement has been requested.";
  scenePanel.scrollIntoView({ block: "nearest" });
  return {
    starter: starter.id,
    label: starter.label,
    scene: starter.scene,
    relatedWork: { title: starter.project.title, url: starter.project.url, evidence: starter.project.evidence },
    suggestedNextTurns: ["Inspect the supplied example", "Show the related published Valia story"],
    boundary: "Personal context is optional. Do not ask for a full problem statement or confidential details.",
    note: "The scenario is visible on the shared page.",
  };
}

function fillCard(card) {
  const starter = getStarter(card.starter);
  activeStarter = starter.id;
  document.querySelector("#card-curiosity").value = card.sharedCuriosity;
  document.querySelector("#card-question").value = card.openQuestion;
  document.querySelector("#card-opener").value = card.opener;
  document.querySelector("#card-evidence").textContent = `${starter.project.title} — ${starter.project.evidence}`;
  const source = document.querySelector("#card-source");
  source.href = starter.project.url;
  source.textContent = `Read ${starter.project.title}`;
  cardPanel.hidden = false;
  status.textContent = "Conversation card ready to edit. It is local to this page and has not been sent.";
  cardPanel.scrollIntoView({ block: "nearest" });
  return {
    ...card,
    publishedConnection: { title: starter.project.title, url: starter.project.url, evidence: starter.project.evidence },
    state: "visible_and_editable",
    privacy: "Not saved or sent. The visitor must explicitly copy the card.",
  };
}

function currentCard() {
  return {
    starter: activeStarter,
    sharedCuriosity: document.querySelector("#card-curiosity").value,
    openQuestion: document.querySelector("#card-question").value,
    opener: document.querySelector("#card-opener").value,
  };
}

function discardCard() {
  activeStarter = null;
  scenePanel.hidden = true;
  cardPanel.hidden = true;
  for (const id of ["rehearsal-title", "rehearsal-example", "rehearsal-question"]) document.querySelector(`#${id}`).textContent = "";
  const related = document.querySelector("#rehearsal-related");
  related.href = "/#projects";
  related.textContent = "Show related work";
  clearCardFields();
  status.textContent = "Rehearsal discarded. Nothing was stored or sent.";
  section.scrollIntoView({ block: "nearest" });
  return { state: "discarded", persisted: false, transmitted: false };
}

document.querySelectorAll("[data-conversation-starter]").forEach(button => {
  button.addEventListener("click", () => openIcebreaker(getStarter(button.dataset.conversationStarter)));
});

document.querySelector("#make-conversation-card")?.addEventListener("click", () => {
  if (activeStarter) fillCard(defaultConversationCard(activeStarter));
});

document.querySelector("#copy-conversation-card")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(formatConversationCard(currentCard()));
    status.textContent = "Conversation card copied. Nothing else happened—which is the point.";
  } catch {
    status.textContent = "Copy was unavailable; the editable card is still here.";
  }
});

document.querySelector("#discard-conversation-card")?.addEventListener("click", discardCard);

async function registerSiteTools() {
  if (typeof document.modelContext?.registerTool !== "function") return;
  const tools = createConversationToolDefinitions({ openIcebreaker, draftCard: fillCard, discardCard });
  for (const tool of tools) await document.modelContext.registerTool(tool);
}

registerSiteTools().catch(error => console.warn("Conversation site tools were unavailable.", error));
