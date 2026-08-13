import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, clueState, complete, parse } from "../assets/vw-core.js";

test("canonical commands parse", () => { for (const command of COMMANDS) assert.notEqual(parse(command).type, "unknown"); });
test("aliases normalize", () => { assert.equal(parse(" help ").command, "vw help"); assert.equal(parse("man   vw").command, "vw help"); assert.equal(parse("whoami").command, "vw about"); assert.equal(parse("ls").command, "vw work"); assert.equal(parse("cat coast.jpg").command, "vw open coast.jpg"); });
test("project slugs", () => { for (const slug of ["voiceguides", "review-system", "earned", "ecowatch"]) assert.equal(parse(`vw inspect ${slug}`).type, "command"); });
test("empty and unknown", () => { assert.equal(parse(" ").type, "empty"); assert.equal(parse("sudo surprise").type, "unknown"); });
test("completion", () => { assert.equal(complete("vw reset").value, "vw reset clues"); assert.ok(complete("vw in").matches.length > 1); assert.equal(complete("vw in").value, "vw in"); });
test("control and clue states", () => { assert.equal(parse("clear").type, "clear"); assert.equal(parse("vw reset clues").type, "reset"); assert.deepEqual(clueState(["1", "1", "4"]), { found:["1","4"], complete:false, remaining:2 }); assert.equal(clueState(["1","2","3","4"]).complete, true); });
