import { TRACE_KEY, complete, parse, clueState } from "./command-core.js";

const ROUTES = {
  "about": ["/#about", "I like difficult problems, real ownership, and systems people can trust."],
  "experience": ["/#experience", "10+ years · monitoring · backend · automation · data · Android · production systems"],
  "projects": ["/#projects", "Four case files: VoiceGuides, review-system, Earned, and EcoWatch."],
  "rehearse hello": ["/#rehearse", "No problem statement required. Pick a familiar kind of mess."],
  "inspect voiceguides": ["/case-studies/voiceguides.html", "Opening VOICEGUIDES(1)…"],
  "inspect review-system": ["/case-studies/review-response.html", "Opening REVIEW-SYSTEM(1)…"],
  "inspect earned": ["/case-studies/earned.html", "Opening EARNED(1)…"],
  "inspect ecowatch": ["/case-studies/ecowatch.html", "Opening ECOWATCH(1)…"],
  "contact": ["/#contact", "email  valjaer@gmail.com\ntelegram  @walsk"],
  "open coast.jpg": ["/#coast", "Opening coast.jpg…"],
  "after-hours": ["/after-hours.html", "Opening the non-essential night shift…"]
};

function readTraces() {
  try { return JSON.parse(localStorage.getItem(TRACE_KEY) || "[]"); } catch { return []; }
}
function writeTraces(ids) {
  try { localStorage.setItem(TRACE_KEY, JSON.stringify(ids)); } catch { /* local-only memory is optional */ }
}
function resetTraces() {
  try { localStorage.removeItem(TRACE_KEY); } catch { /* continue without storage */ }
}

document.querySelectorAll("details.trace[data-trace]").forEach(details => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    const ids = readTraces();
    if (!ids.includes(details.dataset.trace)) writeTraces([...ids, details.dataset.trace]);
  });
});

const disclosure = document.querySelector(".console-disclosure");
const form = document.querySelector(".console-form");
const input = document.querySelector("#command-input");
const output = document.querySelector("#console-output");
const history = [];
let historyIndex = 0;

if (disclosure && matchMedia("(hover: hover) and (pointer: fine) and (min-width: 48rem)").matches) {
  disclosure.open = true;
}

export function reveal(focus = false) {
  if (!disclosure) return;
  disclosure.open = true;
  if (focus) requestAnimationFrame(() => input?.focus({ preventScroll: false }));
}

function result(command, content, href) {
  const block = document.createElement("p");
  block.className = "result";
  const entered = document.createElement("span");
  entered.className = "entered";
  entered.textContent = `$ ${command}`;
  block.append(entered);
  if (href) {
    const link = document.createElement("a"); link.href = href; link.textContent = content; block.append(link);
  } else block.append(document.createTextNode(content));
  output.append(block);
  block.scrollIntoView({ block: "nearest" });
}

export function execute(value) {
  const parsed = parse(value);
  if (parsed.type === "empty") return { ok: false, command: "", text: "No command supplied." };
  history.push(value.trim()); historyIndex = history.length;
  if (parsed.type === "clear") { output?.replaceChildren(); return { ok: true, command: parsed.command, text: "Console output cleared." }; }
  if (parsed.type === "reset") { const text = "Trace progress cleared from this browser."; resetTraces(); result(parsed.command, text); return { ok: true, command: parsed.command, text }; }
  if (parsed.type === "text") { result(parsed.command, parsed.text); return { ok: true, command: parsed.command, text: parsed.text }; }
  if (parsed.type === "unknown") { const text = "command not found. Try 'help'.\nThe machine is less offended than it looks."; result(parsed.command, text); return { ok: false, command: parsed.command, text }; }
  if (parsed.command === "help") {
    const text = "experience · projects · rehearse hello · inspect <project> · contact\nopen coast.jpg · clues · after-hours · reset clues · clear\nAliases: history, work, ls, man valia, whoami, pwd, cat coast.jpg\nTrace progress uses only local browser storage (valia.trace.v1) and is never transmitted.";
    result(parsed.command, text); return { ok: true, command: parsed.command, text };
  }
  if (parsed.command === "clues") {
    const state = clueState(readTraces());
    const text = state.complete ? "4/4 traces found. Continue to /after-hours.html" : `${state.found.length}/4 traces found. ${state.remaining} remain.`;
    const href = state.complete ? "/after-hours.html" : undefined;
    result(parsed.command, text, href); return { ok: true, command: parsed.command, text, href };
  }
  const route = ROUTES[parsed.command];
  if (route) { result(parsed.command, route[1], route[0]); return { ok: true, command: parsed.command, text: route[1], href: route[0] }; }
}

form?.addEventListener("submit", event => { event.preventDefault(); execute(input.value); input.value = ""; });
input?.addEventListener("keydown", event => {
  if (event.key === "ArrowUp" && history.length) { event.preventDefault(); historyIndex = Math.max(0, historyIndex - 1); input.value = history[historyIndex]; }
  if (event.key === "ArrowDown" && history.length) { event.preventDefault(); historyIndex = Math.min(history.length, historyIndex + 1); input.value = history[historyIndex] || ""; }
  if (event.key === "Tab") { const found = complete(input.value); if (found.matches.length) { event.preventDefault(); input.value = found.value; if (found.matches.length > 1) result(input.value, found.matches.join("  ")); } }
  if (event.key === "Escape") { input.blur(); disclosure.open = false; disclosure.querySelector("summary")?.focus(); }
});
document.addEventListener("keydown", event => {
  if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName)) { event.preventDefault(); reveal(true); }
  if (event.ctrlKey && event.key.toLowerCase() === "l" && output) { event.preventDefault(); output.replaceChildren(); }
  if (event.key === "Tab" && disclosure && !disclosure.open) reveal(false);
});
document.querySelectorAll("[data-command]").forEach(control => control.addEventListener("click", () => {
  const target = control.getAttribute("href");
  if (!target || target.startsWith("#")) return;
  // Real links keep their native navigation; controls without destinations print output.
  if (control.tagName === "BUTTON") { reveal(false); execute(control.dataset.command); }
}));

document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    if (status) status.textContent = "Copied. Choose a channel and make it yours.";
  } catch {
    if (status) status.textContent = "Copy was unavailable; select the message above instead.";
  }
}));
