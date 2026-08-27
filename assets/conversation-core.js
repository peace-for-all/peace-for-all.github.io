import { PROJECTS } from "./webmcp-core.js";

export const STARTERS = {
  reality_dashboard: {
    label: "reality ≠ dashboard", projectId: "review-system",
    scene: "Everything is green.\nThe output has quietly stopped changing.", aside: "Ah. A polite failure.",
    question: "What would you trust first: the green status, or the output that stopped moving? No architecture diagram required.",
    sharedCuriosity: "How do we notice when a system's story and reality stop agreeing?",
    openQuestion: "Which signal would you trust first, and what would you check next?",
    opener: "Hi Valia — reality and a dashboard have stopped agreeing in an interesting way. I liked how your work treats uncertainty as evidence. Would you be open to comparing notes?",
  },
  interrupted_happy_path: {
    label: "the happy path keeps leaving", projectId: "voiceguides",
    scene: "An interruption is rare in a demo.\nIn a life, it is Tuesday.", aside: "The happy path has left the building.",
    question: "What should survive the interruption: progress, intent, or both?",
    sharedCuriosity: "How should software preserve a person's place when ordinary life interrupts the happy path?",
    openQuestion: "What state is genuinely worth preserving across an interruption?",
    opener: "Hi Valia — I liked the way VoiceGuides treats interruptions as normal rather than exceptional. I have a related continuity question. Would you be open to comparing notes?",
  },
  useful_without_surveillance: {
    label: "useful feedback, no surveillance", projectId: "earned",
    scene: "The feature should help.\nIt should not turn a person's attention into a score.", aside: "A metric is not automatically a kindness.",
    question: "What would still be useful if nobody were allowed to measure engagement?",
    sharedCuriosity: "Can feedback be useful without becoming surveillance or coercion?",
    openQuestion: "What would we keep if engagement metrics were unavailable?",
    opener: "Hi Valia — your idea of useful feedback without coercive engagement caught my attention. I am thinking about a similar product boundary. Would you be open to comparing notes?",
  },
  network_other_plans: {
    label: "the network has other plans", projectId: "ecowatch",
    scene: "The observation still matters.\nConnectivity and coordinates disagree.", aside: "The field did not read the requirements.",
    question: "Which fact must remain trustworthy when the network and location are not?",
    sharedCuriosity: "How do we preserve trustworthy field observations when connectivity and coordinates are imperfect?",
    openQuestion: "Which piece of evidence must remain reliable when the environment is not?",
    opener: "Hi Valia — EcoWatch's treatment of imperfect networks and coordinates felt familiar. I have a related field-data question. Would you be open to comparing notes?",
  },
};

export const STARTER_IDS = Object.keys(STARTERS);
export const CONTINUATION_PATHS = ["follow_clue", "show_connection"];
export const PROJECT_IDS = PROJECTS.map(project => project.id);
export const VISIBLE_BEAT_LIMIT = 3;
const FIELD_LIMITS = { sharedCuriosity: 180, openQuestion: 180, opener: 280, reason: 160 };

export function getStarter(starter) {
  if (!Object.hasOwn(STARTERS, starter)) throw new TypeError(`Unknown conversation starter: ${starter}`);
  const definition = STARTERS[starter];
  const project = PROJECTS.find(candidate => candidate.id === definition.projectId);
  if (!project) throw new TypeError(`Unknown starter project: ${definition.projectId}`);
  return { id: starter, ...definition, project };
}

export function getProject(projectId) {
  const project = PROJECTS.find(candidate => candidate.id === projectId);
  if (!project) throw new TypeError(`Unknown portfolio project: ${projectId}`);
  return project;
}

export function continuationBeat(starterId, path) {
  const starter = getStarter(starterId);
  if (!CONTINUATION_PATHS.includes(path)) throw new TypeError(`Unknown diary path: ${path}`);
  if (path === "follow_clue") return { kind: "question", label: "one small question", text: starter.question };
  return { kind: "evidence", label: `published clue · ${starter.project.title}`, text: starter.project.evidence, url: starter.project.url, linkText: `read ${starter.project.title}`, projectId: starter.project.id };
}

export function normalizeConnection(input) {
  const project = getProject(input?.project);
  const reason = String(input?.reason ?? "").trim();
  if (!reason) throw new TypeError("reason is required");
  if (reason.length > FIELD_LIMITS.reason) throw new TypeError(`reason exceeds ${FIELD_LIMITS.reason} characters`);
  return { project, reason };
}

export function splitDiaryTrail(beats, limit = VISIBLE_BEAT_LIMIT) {
  const safeLimit = Math.max(1, Number(limit) || VISIBLE_BEAT_LIMIT);
  const splitAt = Math.max(0, beats.length - safeLimit);
  return { earlier: beats.slice(0, splitAt), visible: beats.slice(splitAt) };
}

export function normalizeConversationCard(input) {
  const starter = getStarter(input?.starter);
  const fields = {};
  for (const name of ["sharedCuriosity", "openQuestion", "opener"]) {
    const value = String(input?.[name] ?? "").trim();
    if (!value) throw new TypeError(`${name} is required`);
    if (value.length > FIELD_LIMITS[name]) throw new TypeError(`${name} exceeds ${FIELD_LIMITS[name]} characters`);
    fields[name] = value;
  }
  return { starter: starter.id, ...fields };
}

export function defaultConversationCard(starter) {
  const found = getStarter(starter);
  return normalizeConversationCard({ starter, sharedCuriosity: found.sharedCuriosity, openQuestion: found.openQuestion, opener: found.opener });
}

export function formatConversationCard(card) {
  const normalized = normalizeConversationCard(card);
  const starter = getStarter(normalized.starter);
  return ["A possible hello", normalized.opener, "", "What caught our attention", normalized.sharedCuriosity, "", "A question worth discussing", normalized.openQuestion, "", "Published connection", `${starter.project.title} — ${starter.project.evidence}`].join("\n");
}

export function createConversationToolDefinitions({ openIcebreaker, continueIcebreaker, connectWork, draftCard, resetDiary }) {
  return [
    { name: "open_teamwork_icebreaker", description: "Open one tiny supplied engineering scene in the shared living-diary page. Do not ask the visitor for a problem statement or confidential context.", inputSchema: { type: "object", properties: { starter: { type: "string", enum: STARTER_IDS } }, required: ["starter"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async ({ starter }) => openIcebreaker(getStarter(starter)) },
    { name: "continue_teamwork_icebreaker", description: "Continue the active diary thread with either one gentle question or its fixed published portfolio connection.", inputSchema: { type: "object", properties: { path: { type: "string", enum: CONTINUATION_PATHS } }, required: ["path"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async ({ path }) => continueIcebreaker(path) },
    { name: "connect_published_work", description: "Add a fixed published portfolio clue and a short, visibly provisional agent inference to the shared diary. Never present the inference as Valia's own view.", inputSchema: { type: "object", properties: { project: { type: "string", enum: PROJECT_IDS }, reason: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.reason } }, required: ["project", "reason"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async input => connectWork(normalizeConnection(input)) },
    { name: "draft_conversation_card", description: "Create an editable, local-only conversation card for the active diary thread. Use only sanitized context the visitor volunteered; do not speak as Valia or imply anything was sent.", inputSchema: { type: "object", properties: { starter: { type: "string", enum: STARTER_IDS }, sharedCuriosity: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.sharedCuriosity }, openQuestion: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.openQuestion }, opener: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.opener } }, required: ["starter", "sharedCuriosity", "openQuestion", "opener"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async input => draftCard(normalizeConversationCard(input)) },
    { name: "reset_diary", description: "Clear the visible, unsaved diary thread and conversation card. Nothing is transmitted or deleted remotely.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async () => resetDiary() },
  ];
}
