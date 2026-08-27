export const FOCUS_AREAS = [
  "android",
  "backend",
  "production",
  "reliability",
  "automation",
  "data",
  "offline-first",
  "human-in-the-loop",
];

export const PROJECTS = [
  {
    id: "voiceguides",
    title: "VoiceGuides",
    url: "/case-studies/voiceguides.html",
    focus: ["android", "reliability", "offline-first", "human-in-the-loop"],
    evidence: "Native Android listening with offline ownership, interruption-safe progress, anchored questions, and deliberately narrow permissions.",
  },
  {
    id: "review-system",
    title: "Review-response system",
    url: "/case-studies/review-response.html",
    focus: ["backend", "production", "reliability", "automation", "data", "human-in-the-loop"],
    evidence: "Production Python workflow with observable failures, provenance, explicit write gates, and a human controlling every public response.",
  },
  {
    id: "earned",
    title: "Earned",
    url: "/case-studies/earned.html",
    focus: ["android", "offline-first", "human-in-the-loop"],
    evidence: "Local-first Android product work exploring useful feedback without surveillance or coercive engagement mechanics.",
  },
  {
    id: "ecowatch",
    title: "EcoWatch",
    url: "/case-studies/ecowatch.html",
    focus: ["android", "data", "reliability", "offline-first"],
    evidence: "Offline-first field capture designed for intermittent networks, imperfect coordinates, and later reconciliation.",
  },
];

export function normalizeFocus(focus) {
  if (!Array.isArray(focus) || focus.length === 0) throw new TypeError("focus must contain at least one focus area");
  const normalized = [...new Set(focus.map(value => String(value).trim().toLowerCase()))];
  const unknown = normalized.filter(value => !FOCUS_AREAS.includes(value));
  if (unknown.length) throw new TypeError(`Unknown focus area: ${unknown.join(", ")}`);
  return normalized;
}

export function matchProjects(focus, limit = 3) {
  const requested = normalizeFocus(focus);
  return PROJECTS
    .map((project, order) => {
      const matchedFocus = requested.filter(value => project.focus.includes(value));
      return { ...project, matchedFocus, score: matchedFocus.length, order };
    })
    .filter(project => project.score > 0)
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .slice(0, limit)
    .map(({ order, ...project }) => project);
}

export function createToolDefinitions({ commands, showRelevantWork, runCommand }) {
  return [
    {
      name: "show_relevant_work",
      description: "Find and visibly highlight Valia's portfolio projects that match engineering focus areas. Changes only the current page display.",
      inputSchema: {
        type: "object",
        properties: {
          focus: {
            type: "array",
            description: "One or more engineering focus areas to match.",
            items: { type: "string", enum: FOCUS_AREAS },
            minItems: 1,
            maxItems: FOCUS_AREAS.length,
            uniqueItems: true,
          },
        },
        required: ["focus"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async ({ focus }) => showRelevantWork(normalizeFocus(focus)),
    },
    {
      name: "run_portfolio_command",
      description: "Run a command in the visible portfolio console. The clear command clears console output; reset clues deletes local-only trace progress.",
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "A canonical command supported by the portfolio console.",
            enum: commands,
          },
        },
        required: ["command"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: async ({ command }) => {
        if (!commands.includes(command)) throw new TypeError(`Unknown portfolio command: ${command}`);
        return runCommand(command);
      },
    },
  ];
}
