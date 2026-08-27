import { PROJECTS } from "./webmcp-core.js";

export const STARTERS = {
  reality_dashboard: {
    label: "reality ≠ dashboard",
    projectId: "review-system",
    scene: "Everything is green. The output has quietly stopped changing.",
    smallQuestion: "What would you trust first: the green status, or the output that stopped moving? No architecture diagram required.",
    sharedCuriosity: "How do we notice when a system's story and reality stop agreeing?",
    openQuestion: "Which signal would you trust first, and what would you check next?",
    opener: "Hi Valia — reality and a dashboard have stopped agreeing in an interesting way. I liked how your work treats uncertainty as evidence. Would you be open to comparing notes?",
  },
  interrupted_happy_path: {
    label: "the happy path keeps leaving",
    projectId: "voiceguides",
    scene: "An interruption is rare in a demo and normal in a life.",
    smallQuestion: "What should survive the interruption: progress, intent, or both?",
    sharedCuriosity: "How should software preserve a person's place when ordinary life interrupts the happy path?",
    openQuestion: "What state is genuinely worth preserving across an interruption?",
    opener: "Hi Valia — I liked the way VoiceGuides treats interruptions as normal rather than exceptional. I have a related continuity question. Would you be open to comparing notes?",
  },
  useful_without_surveillance: {
    label: "useful feedback, no surveillance",
    projectId: "earned",
    scene: "The feature should help without turning a person's attention into a score.",
    smallQuestion: "What would still be useful if nobody were allowed to measure engagement?",
    sharedCuriosity: "Can feedback be useful without becoming surveillance or coercion?",
    openQuestion: "What would we keep if engagement metrics were unavailable?",
    opener: "Hi Valia — your idea of useful feedback without coercive engagement caught my attention. I am thinking about a similar product boundary. Would you be open to comparing notes?",
  },
  network_other_plans: {
    label: "the network has other plans",
    projectId: "ecowatch",
    scene: "The observation still matters when connectivity and coordinates disagree.",
    smallQuestion: "Which fact must remain trustworthy when the network and location are not?",
    sharedCuriosity: "How do we preserve trustworthy field observations when connectivity and coordinates are imperfect?",
    openQuestion: "Which piece of evidence must remain reliable when the environment is not?",
    opener: "Hi Valia — EcoWatch's treatment of imperfect networks and coordinates felt familiar. I have a related field-data question. Would you be open to comparing notes?",
  },
};

export const STARTER_IDS = Object.keys(STARTERS);
const FIELD_LIMITS = { sharedCuriosity: 180, openQuestion: 180, opener: 280 };

export function getStarter(starter) {
  if (!Object.hasOwn(STARTERS, starter)) throw new TypeError(`Unknown conversation starter: ${starter}`);
  const definition = STARTERS[starter];
  const project = PROJECTS.find(candidate => candidate.id === definition.projectId);
  if (!project) throw new TypeError(`Unknown starter project: ${definition.projectId}`);
  return { id: starter, ...definition, project };
}

export function normalizeConversationCard(input) {
  const starter = getStarter(input?.starter);
  const fields = {};
  for (const [name, limit] of Object.entries(FIELD_LIMITS)) {
    const value = String(input?.[name] ?? "").trim();
    if (!value) throw new TypeError(`${name} is required`);
    if (value.length > limit) throw new TypeError(`${name} exceeds ${limit} characters`);
    fields[name] = value;
  }
  return { starter: starter.id, ...fields };
}

export function defaultConversationCard(starter) {
  const found = getStarter(starter);
  return normalizeConversationCard({
    starter,
    sharedCuriosity: found.sharedCuriosity,
    openQuestion: found.openQuestion,
    opener: found.opener,
  });
}

export function formatConversationCard(card) {
  const normalized = normalizeConversationCard(card);
  const starter = getStarter(normalized.starter);
  return [
    "A possible hello",
    normalized.opener,
    "",
    "What caught our attention",
    normalized.sharedCuriosity,
    "",
    "A question worth discussing",
    normalized.openQuestion,
    "",
    "Published connection",
    `${starter.project.title} — ${starter.project.evidence}`,
  ].join("\n");
}

export function createConversationToolDefinitions({ openIcebreaker, draftCard, discardCard }) {
  return [
    {
      name: "open_teamwork_icebreaker",
      description: "Open a friendly supplied engineering scenario on the shared portfolio page. Do not ask the visitor for a problem statement; offer to inspect the example or show the related published Valia story.",
      inputSchema: {
        type: "object",
        properties: { starter: { type: "string", enum: STARTER_IDS, description: "The familiar kind of engineering mess to explore." } },
        required: ["starter"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async ({ starter }) => openIcebreaker(getStarter(starter)),
    },
    {
      name: "draft_conversation_card",
      description: "Create an editable, local-only conversation card on the shared page. Use only sanitized context the visitor volunteered. Do not speak as Valia, promise an outcome, or imply the card was sent.",
      inputSchema: {
        type: "object",
        properties: {
          starter: { type: "string", enum: STARTER_IDS },
          sharedCuriosity: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.sharedCuriosity },
          openQuestion: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.openQuestion },
          opener: { type: "string", minLength: 1, maxLength: FIELD_LIMITS.opener },
        },
        required: ["starter", "sharedCuriosity", "openQuestion", "opener"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async input => draftCard(normalizeConversationCard(input)),
    },
    {
      name: "discard_conversation_card",
      description: "Discard the visible, unsaved conversation rehearsal from the page. Nothing is transmitted or deleted remotely.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: async () => discardCard(),
    },
  ];
}
