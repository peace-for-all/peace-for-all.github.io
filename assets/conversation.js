import { continuationBeat, createConversationToolDefinitions, defaultConversationCard, formatConversationCard, getStarter, splitDiaryTrail } from "./conversation-core.js";

const intro = document.querySelector("#diary-intro");
const thread = document.querySelector("#diary-thread");
const trail = document.querySelector("#diary-trail");
const earlier = document.querySelector("#earlier-ink");
const earlierList = document.querySelector("#earlier-ink-list");
const cardPanel = document.querySelector("#conversation-card");
const status = document.querySelector("#diary-status");
const announcement = document.querySelector("#diary-announcement");
const makeCardButton = document.querySelector("#make-conversation-card");
let activeStarter = null;
let beats = [];
let usedPaths = new Set();

function ensureDiaryMode() {
  document.documentElement.classList.add("diary-mode");
  document.querySelector("#diary")?.scrollIntoView({ block: "start" });
}

function beatNode(beat, isNewest = false) {
  const article = document.createElement("article");
  article.className = `diary-beat diary-beat-${beat.kind}${isNewest ? " is-new" : ""}`;
  const label = document.createElement("p");
  label.className = "diary-beat-label";
  label.textContent = beat.label;
  const body = document.createElement("p");
  body.className = "diary-beat-text";
  body.textContent = beat.text;
  article.append(label, body);
  if (beat.aside) {
    const aside = document.createElement("p");
    aside.className = "diary-aside";
    aside.textContent = beat.aside;
    article.append(aside);
  }
  if (beat.url) {
    const link = document.createElement("a");
    link.href = beat.url;
    link.textContent = beat.linkText || "read the published work";
    article.append(link);
  }
  return article;
}

function renderTrail() {
  const parts = splitDiaryTrail(beats);
  trail.replaceChildren(...parts.visible.map((beat, index) => beatNode(beat, index === parts.visible.length - 1)));
  earlierList.replaceChildren(...parts.earlier.map(beat => beatNode(beat)));
  earlier.hidden = parts.earlier.length === 0;
  const newest = beats.at(-1);
  if (newest) announcement.textContent = `${newest.label}: ${newest.text}`;
}

function appendBeat(beat) {
  beats.push(beat);
  renderTrail();
}

function clearCardFields() {
  for (const id of ["card-curiosity", "card-question", "card-opener"]) document.querySelector(`#${id}`).value = "";
  document.querySelector("#card-evidence").textContent = "";
  const source = document.querySelector("#card-source");
  source.href = "/?view=all#projects";
  source.textContent = "Read the published connection";
}

function openIcebreaker(starter) {
  ensureDiaryMode();
  activeStarter = starter.id;
  beats = [];
  usedPaths = new Set();
  clearCardFields();
  cardPanel.hidden = true;
  intro.hidden = true;
  thread.hidden = false;
  makeCardButton.hidden = true;
  document.querySelectorAll("[data-diary-path]").forEach(button => { button.disabled = false; });
  appendBeat({ kind: "scene", label: starter.label, text: starter.scene, aside: starter.aside });
  status.textContent = "A tiny scene is open. No problem statement required.";
  return { starter: starter.id, scene: starter.scene, aside: starter.aside, relatedWork: { title: starter.project.title, url: starter.project.url }, suggestedNextTurns: ["follow_clue", "show_connection"], boundary: "Personal or confidential context is optional. Keep this light." };
}

function continueIcebreaker(path) {
  if (!activeStarter) throw new TypeError("Open an icebreaker first");
  const beat = continuationBeat(activeStarter, path);
  if (usedPaths.has(path)) return { state: "already_visible", beat };
  usedPaths.add(path);
  appendBeat(beat);
  document.querySelector(`[data-diary-path="${path}"]`).disabled = true;
  makeCardButton.hidden = false;
  status.textContent = path === "follow_clue" ? "One small question added." : "A fixed, published connection added.";
  return { state: "visible", beat, visibleBeats: splitDiaryTrail(beats).visible.length };
}

function connectWork(connection) {
  if (!activeStarter) throw new TypeError("Open an icebreaker first");
  const evidence = { kind: "evidence", label: `published clue · ${connection.project.title}`, text: connection.project.evidence, url: connection.project.url, linkText: `read ${connection.project.title}` };
  const inference = { kind: "inference", label: "agent inference · provisional", text: connection.reason };
  appendBeat(evidence);
  appendBeat(inference);
  makeCardButton.hidden = false;
  status.textContent = "Published evidence and a separately labelled agent inference added.";
  return { state: "visible", evidence, inference, epistemicStatus: "The evidence is fixed portfolio copy; the reason is an agent inference." };
}

function fillCard(card) {
  if (!activeStarter) throw new TypeError("Open an icebreaker first");
  if (card.starter !== activeStarter) throw new TypeError("The card must match the active thread");
  const starter = getStarter(card.starter);
  document.querySelector("#card-curiosity").value = card.sharedCuriosity;
  document.querySelector("#card-question").value = card.openQuestion;
  document.querySelector("#card-opener").value = card.opener;
  document.querySelector("#card-evidence").textContent = `${starter.project.title} — ${starter.project.evidence}`;
  const source = document.querySelector("#card-source");
  source.href = starter.project.url;
  source.textContent = `Read ${starter.project.title}`;
  cardPanel.hidden = false;
  status.textContent = "An editable, unsent hello is ready.";
  cardPanel.scrollIntoView({ block: "nearest" });
  return { ...card, state: "visible_and_editable", privacy: "Not saved or sent. Copying is the only handoff." };
}

function currentCard() {
  return { starter: activeStarter, sharedCuriosity: document.querySelector("#card-curiosity").value, openQuestion: document.querySelector("#card-question").value, opener: document.querySelector("#card-opener").value };
}

function discardCard() {
  clearCardFields();
  cardPanel.hidden = true;
  status.textContent = "The card is gone. The thread is still here.";
}

function resetDiary() {
  activeStarter = null;
  beats = [];
  usedPaths = new Set();
  trail.replaceChildren();
  earlierList.replaceChildren();
  earlier.hidden = true;
  clearCardFields();
  cardPanel.hidden = true;
  thread.hidden = true;
  intro.hidden = false;
  announcement.textContent = "Diary reset.";
  status.textContent = "Fresh page. Nothing was stored or sent.";
  return { state: "reset", persisted: false, transmitted: false };
}

document.querySelectorAll("[data-conversation-starter]").forEach(button => button.addEventListener("click", () => openIcebreaker(getStarter(button.dataset.conversationStarter))));
document.querySelectorAll("[data-diary-path]").forEach(button => button.addEventListener("click", () => continueIcebreaker(button.dataset.diaryPath)));
makeCardButton?.addEventListener("click", () => { if (activeStarter) fillCard(defaultConversationCard(activeStarter)); });
document.querySelector("#reset-diary")?.addEventListener("click", resetDiary);
document.querySelector("#discard-conversation-card")?.addEventListener("click", discardCard);
document.querySelector("#copy-conversation-card")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(formatConversationCard(currentCard()));
    status.textContent = "Card copied. Nothing else happened—which is the point.";
  } catch {
    status.textContent = "Copy was unavailable; the editable card is still here.";
  }
});

document.addEventListener("diary:portfolio-matches", event => {
  if (!event.detail?.matches?.length) return;
  const match = event.detail.matches[0];
  if (!activeStarter) {
    const starterButton = [...document.querySelectorAll("[data-conversation-starter]")].find(button => getStarter(button.dataset.conversationStarter).project.id === match.id);
    if (starterButton) openIcebreaker(getStarter(starterButton.dataset.conversationStarter));
  }
  appendBeat({ kind: "evidence", label: `published clue · ${match.title}`, text: match.evidence, url: match.url, linkText: `read ${match.title}` });
  makeCardButton.hidden = false;
});

async function registerSiteTools() {
  if (typeof document.modelContext?.registerTool !== "function") return;
  const tools = createConversationToolDefinitions({ openIcebreaker, continueIcebreaker, connectWork, draftCard: fillCard, resetDiary });
  for (const tool of tools) await document.modelContext.registerTool(tool);
}

registerSiteTools().catch(error => console.warn("Conversation site tools were unavailable.", error));
