import { COMMANDS } from "./command-core.js";
import { execute, reveal } from "./console.js";
import { createToolDefinitions, matchProjects } from "./webmcp-core.js";

function showRelevantWork(focus) {
  const matches = matchProjects(focus);
  const compactMatches = matches.map(({ id, title, url, matchedFocus, evidence }) => ({ id, title, url, matchedFocus, evidence }));
  if (document.documentElement.classList.contains("diary-mode")) {
    document.dispatchEvent(new CustomEvent("diary:portfolio-matches", { detail: { matches: compactMatches } }));
    return { requestedFocus: focus, matches: compactMatches, presentation: "diary_fragment" };
  }
  document.querySelectorAll("[data-project]").forEach(card => {
    card.classList.toggle("agent-match", matches.some(project => project.id === card.dataset.project));
  });

  const status = document.querySelector("#webmcp-status");
  if (status) {
    status.hidden = false;
    status.textContent = matches.length
      ? `Agent match: ${matches.map(project => project.title).join(" · ")}`
      : "No matching case studies found.";
  }
  document.querySelector(`[data-project="${matches[0]?.id}"]`)?.scrollIntoView({ block: "center" });

  return {
    requestedFocus: focus,
    matches: compactMatches,
    presentation: "portfolio_highlight",
  };
}

function runCommand(command) {
  reveal(false);
  return execute(command);
}

async function registerSiteTools() {
  if (typeof document.modelContext?.registerTool !== "function") return;
  const commands = [...COMMANDS, "pwd"];
  const tools = createToolDefinitions({ commands, showRelevantWork, runCommand });
  for (const tool of tools) await document.modelContext.registerTool(tool);
}

registerSiteTools().catch(error => console.warn("Portfolio site tools were unavailable.", error));
