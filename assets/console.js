import { TRACE_KEY, complete, parse, clueState } from "./vw-core.js";

const ROUTES = {
  "vw about": ["/#about", "I like difficult problems, real ownership, and systems people can trust."],
  "vw work": ["/#work", "Four case files: VoiceGuides, review-system, Earned, and EcoWatch."],
  "vw inspect voiceguides": ["/case-studies/voiceguides.html", "Opening VOICEGUIDES(1)…"],
  "vw inspect review-system": ["/case-studies/review-response.html", "Opening REVIEW-SYSTEM(1)…"],
  "vw inspect earned": ["/case-studies/earned.html", "Opening EARNED(1)…"],
  "vw inspect ecowatch": ["/case-studies/ecowatch.html", "Opening ECOWATCH(1)…"],
  "vw history": ["/#history", "10+ years · monitoring · backend · automation · data · Android · production systems"],
  "vw approach": ["/#approach", "Short loops. Candid trade-offs. Inspectable systems. Calm diagnosis."],
  "vw collaborate": ["/#collaborate", "Useful problems, shared ownership, sharp and kind teammates."],
  "vw contact": ["/#contact", "email  valjaer@gmail.com\ntelegram  @walsk"],
  "vw open coast.jpg": ["/#coast", "Opening coast.jpg…"],
  "vw after-hours": ["/after-hours.html", "Opening the non-essential night shift…"]
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

function reveal(focus = false) {
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

function execute(value) {
  const parsed = parse(value);
  if (parsed.type === "empty") return;
  history.push(value.trim()); historyIndex = history.length;
  if (parsed.type === "clear") { output.replaceChildren(); return; }
  if (parsed.type === "reset") { resetTraces(); result(parsed.command, "Trace progress cleared from this browser."); return; }
  if (parsed.type === "text") { result(parsed.command, parsed.text); return; }
  if (parsed.type === "unknown") { result(parsed.command, "vw: command not found. Try 'vw help'.\nThe machine is less offended than it looks."); return; }
  if (parsed.command === "vw help") {
    result(parsed.command, "about · work · inspect <project> · history · approach · contact\nopen coast.jpg · clues · after-hours · reset clues · clear\nAliases: help, man vw, whoami, ls, pwd, cat coast.jpg\nTrace progress uses only local browser storage (vw.trace.v1) and is never transmitted."); return;
  }
  if (parsed.command === "vw clues") {
    const state = clueState(readTraces());
    result(parsed.command, state.complete ? "4/4 traces found. Continue to /after-hours.html" : `${state.found.length}/4 traces found. ${state.remaining} remain.`, state.complete ? "/after-hours.html" : undefined); return;
  }
  const route = ROUTES[parsed.command];
  if (route) result(parsed.command, route[1], route[0]);
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
