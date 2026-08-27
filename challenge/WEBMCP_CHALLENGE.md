# The Message Is Not the Situation

An agent-readable engineering case file where a person and an agent investigate an ambiguous customer message together—and where insufficient context is a successful outcome.

## Links

- Live investigation: <https://peace-for-all.github.io/case-studies/review-response.html#case-lab>
- Live portfolio: <https://peace-for-all.github.io/>
- Source: <https://github.com/peace-for-all/peace-for-all.github.io>

## Three-minute judge journey

Give the judge one prompt:

> Investigate the customer question on this page. Inspect the connected evidence one source at a time, tell me when the interpretation is still uncertain, and then place your final assessment on the page.

The intended journey is:

1. The person and agent begin with the same deceptively simple public message: “Is this product available?”
2. The agent calls `inspect_customer_case_evidence` for one source at a time. Each fact appears in the shared interface as well as in the tool result.
3. After partial evidence, the agent can call `assess_customer_case`; the page identifies a strong conclusion as premature. `insufficient_context` is explicitly supported.
4. The remaining sources reveal an existing order, an overlapping fulfilment outage, and an unanswered support request.
5. The final assessment identifies an unfulfilled-order escalation expressed through an availability question. The assessment appears on the page for the person to inspect.
6. The result explicitly states that it cannot authorize or send a customer response.

The reveal order is deliberately flexible. The experience should remain coherent if the agent inspects sources in a different order, abstains early, or reassesses more than once.

## Demo video script — target 2:35

### 0:00–0:18 — Hook

**Screen:** Open directly on the customer question.

**Narration:**

> “Is this product available?” looks like an easy message. A support system could answer, “Yes, you can buy it here,” and report a perfectly successful send. It would also be completely wrong.

### 0:18–0:35 — The product idea

**Screen:** Show the empty evidence area and the three source controls.

**Narration:**

> This is The Message Is Not the Situation: an interactive engineering case file. A person and an agent investigate the same customer journey, in the same page, without pretending that fluent language is evidence.

### 0:35–1:18 — WebMCP investigation

**Screen:** In ChatGPT’s browser, send the judge prompt. Keep the page and agent visible. Let the agent inspect the order record and place or explain an early assessment before inspecting everything.

**Narration:**

> The page exposes a narrow WebMCP evidence tool. Every call reveals the result to me too. With only an order record, the stronger interpretation is possible but premature. The agent can explicitly say there is not enough context.

**Screen:** Let the agent inspect the incident log and support chat. The three evidence cards should accumulate visibly.

### 1:18–1:43 — Payoff

**Screen:** The agent calls `assess_customer_case`; show the assessment panel.

**Narration:**

> Now the situation is legible. This person had already ordered, an outage disrupted fulfilment, and support chat never answered. They used a public marketplace question because it was the channel that still responded. The message was about availability; the situation was an unfulfilled order and a failed support journey.

### 1:43–2:08 — Why WebMCP

**Screen:** Briefly open the available site-tools list, then return to the accumulated evidence.

**Narration:**

> Without WebMCP, an agent has to infer controls from the visual interface and keep its investigation hidden in chat. Here, the website provides explicit evidence sources and constrained interpretations. The person sees every fact and the final reasoning in the live application. Manual controls still work without an agent.

### 2:08–2:27 — Safety and technical implementation

**Screen:** Show the tool definitions briefly: narrow enums, `additionalProperties: false`, and the assessment result. Do not linger on code.

**Narration:**

> The tools are dependency-free JavaScript registered through `document.modelContext.registerTool`. Inputs use closed schemas. Unknown is a valid answer. The assessment is visibly non-authoritative: it cannot draft, send, or approve a customer response.

### 2:27–2:35 — Close

**Screen:** Rest on “the map that knows where it is blank.”

**Narration:**

> Useful systems should know not only when they have seen something before, but when the map is blank. The message is not the situation.

## Recording checklist

- Record at 1080p or higher with browser zoom large enough to read tool results.
- Use the live URL, a fresh page load, and no private tabs or customer data.
- Keep the browser’s available-site-tools view visible long enough to establish that WebMCP is real.
- Capture an early uncertain assessment as well as the final supported one; this is the core product behavior.
- Keep the final cut under 2:45 to leave margin below the three-minute hard limit.
- Use voice only or music with documented permission.
- Upload publicly to YouTube and verify playback in a signed-out window.

## Submission description

### What it does

The Message Is Not the Situation turns an engineering portfolio case study into a shared investigation. A deceptively simple marketplace question invites a plausible but wrong template response. A person and an agent progressively connect the order record, an incident, and an unanswered support conversation, then place an evidence-aware interpretation in the page.

The experience is reconstructed and anonymized from a real class of production problem: short, language-dependent messages often omit the operational situation that determines the correct workflow.

### Why WebMCP is a strong fit

The useful unit is not a chatbot answer; it is a shared, inspectable investigation. WebMCP gives the agent explicit evidence sources and bounded assessment choices while preserving the website as the common workspace. Each tool call updates the interface, so the person can see what the agent learned, challenge its conclusion, reveal evidence manually, or continue from the same state.

This would be weaker with browser automation alone: the agent would need to infer meaning from buttons and DOM structure, while its evidence trail would remain primarily in chat. The site tools make the application’s semantics explicit.

### What becomes better for people and agents

- The agent can inspect connected sources without guessing how the interface works.
- The person sees the same evidence and assessment rather than receiving an opaque conclusion.
- Partial evidence produces a visible premature or insufficient-context result.
- The tool boundary makes it impossible to mistake similarity or interpretation for permission to send.
- Visitors without WebMCP retain the complete written case study and manual evidence controls.

### Implementation

The static site uses dependency-free ES modules. Page-specific tools are registered with `document.modelContext.registerTool`. `inspect_customer_case_evidence` accepts one closed-enum source and reveals the corresponding fact in the page. `assess_customer_case` accepts a closed-enum interpretation and a short rationale, evaluates it only against revealed evidence, and places the result in an ARIA live region. Both tools return structured verification details. There is no API key, server, model call, authentication, analytics, or remote state.

The broader portfolio also exposes tools that match engineering case studies to a visitor’s interests and operate its visible terminal interface. All WebMCP work was added during the challenge period.

## Submission checklist

- [x] Working public application
- [x] Public source repository
- [x] WebMCP implementation added during the challenge period
- [x] Human fallback for browsers without WebMCP
- [x] Automated schema, behavior, structure, and safety-boundary tests
- [x] Project description draft
- [x] Demo script and recording checklist
- [ ] Open-source license visible and detectable on the repository
- [ ] Record, edit, and upload the public YouTube demo
- [ ] Add the final YouTube URL here and to Devpost
- [ ] Confirm live app and video from a signed-out browser
- [ ] Submit before September 3, 2026 at 1:00 p.m. Pacific Time

