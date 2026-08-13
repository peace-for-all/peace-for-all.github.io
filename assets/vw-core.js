export const TRACE_KEY = "vw.trace.v1";

export const COMMANDS = [
  "vw help", "vw about", "vw work", "vw inspect voiceguides",
  "vw inspect review-system", "vw inspect earned", "vw inspect ecowatch",
  "vw history", "vw approach", "vw collaborate", "vw contact",
  "vw open coast.jpg", "vw clues", "vw after-hours", "vw reset clues", "clear"
];

const ALIASES = new Map([
  ["help", "vw help"], ["man vw", "vw help"], ["whoami", "vw about"],
  ["ls", "vw work"], ["cat coast.jpg", "vw open coast.jpg"]
]);

export function normalize(input) {
  return String(input ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function parse(input) {
  const raw = normalize(input);
  if (!raw) return { type: "empty", command: "" };
  if (raw === "pwd") return { type: "text", command: raw, text: "/home/valia/between-disciplines" };
  const command = ALIASES.get(raw) || raw.replace(/^vw work --short$/, "vw work").replace(/^vw history --signal$/, "vw history");
  if (!COMMANDS.includes(command)) return { type: "unknown", command: raw };
  if (command === "clear") return { type: "clear", command };
  if (command === "vw reset clues") return { type: "reset", command };
  return { type: "command", command };
}

export function complete(input) {
  const value = normalize(input);
  if (!value) return { value, matches: [] };
  const candidates = [...COMMANDS, ...ALIASES.keys(), "pwd"];
  const matches = candidates.filter(command => command.startsWith(value));
  return { value: matches.length === 1 ? matches[0] : value, matches };
}

export function clueState(traceIds) {
  const valid = [...new Set(traceIds)].filter(id => /^[1-4]$/.test(String(id))).map(String).sort();
  return { found: valid, complete: valid.length === 4, remaining: 4 - valid.length };
}
