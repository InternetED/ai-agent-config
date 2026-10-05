#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const healthScript = path.join(scriptDirectory, "skill-health.mjs");

function write(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function runHealth(root) {
  return spawnSync(process.execPath, [healthScript, "--root", root], {
    encoding: "utf8",
  });
}

// Live tree must be healthy and quiet (no stdout when ok).
const live = runHealth(packageRoot);
assert.equal(live.status, 0, `live skill-health failed:\n${live.stderr}${live.stdout}`);
assert.equal(live.stdout, "", "healthy run must be quiet (no stdout)");
assert.equal(live.stderr, "", "healthy run must be quiet (no stderr)");

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "ai-agent-config-skill-health-"));
try {
  write(
    path.join(fixture, "Skills", "demo", "SKILL.md"),
    `---
name: demo
description: Demo. Use when testing health; Not for production.
---

# Demo
`,
  );
  write(
    path.join(fixture, "overlays", "demo", "frontmatter.yaml"),
    "disable-model-invocation: true\n",
  );
  const provenance = {"schemaVersion":1,"sources":{},"localSkills":{"demo":{"repository":"https://github.com/InternetED/ai-agent-config.git","path":"Skills/demo","updatePolicy":"local"}}};
  const provenancePath = path.join(fixture, "upstreams.lock.json");
  const writeProvenance = () => write(provenancePath, JSON.stringify(provenance));
  writeProvenance();

  let result = runHealth(fixture);
  assert.equal(result.status, 0, `fixture healthy failed:\n${result.stderr}`);
  assert.equal(result.stdout, "");

  delete provenance.localSkills.demo;
  writeProvenance();
  result = runHealth(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /skill provenance missing: demo/);
  provenance.localSkills.demo = { repository: "https://github.com/InternetED/ai-agent-config.git", path: "Skills/demo", updatePolicy: "local" };
  provenance.sources.external = { repository: "https://github.com/example/skills.git", commit: "a".repeat(40), skills: ["demo"], skillPaths: { demo: "skills/demo" }, updatePolicy: "manual" };
  writeProvenance();
  result = runHealth(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate skill provenance: demo/);
  delete provenance.localSkills.demo;
  provenance.sources.external.commit = "main";
  provenance.sources.external.skillPaths.demo = "../demo";
  writeProvenance();
  result = runHealth(fixture);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /source requires repository and pinned commit/);
  assert.match(result.stderr, /source path missing or unsafe/);
  provenance.sources.external.commit = "a".repeat(40);
  provenance.sources.external.skillPaths.demo = "skills/demo";
  writeProvenance();
  result = runHealth(fixture);
  assert.equal(result.status, 0, result.stderr);

  // Orphan overlay.
  write(path.join(fixture, "overlays", "ghost", "frontmatter.yaml"), "disable-model-invocation: true\n");
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /orphan overlay: overlays\/ghost\//);
  fs.rmSync(path.join(fixture, "overlays", "ghost"), { recursive: true, force: true });

  // Empty Use when.
  write(
    path.join(fixture, "Skills", "blank", "SKILL.md"),
    `---
name: blank
description: A skill with no trigger text.
---

# Blank
`,
  );
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /empty Use when: Skills\/blank\/SKILL.md/);
  fs.rmSync(path.join(fixture, "Skills", "blank"), { recursive: true, force: true });

  // Overlay name mismatch.
  write(
    path.join(fixture, "overlays", "demo", "SKILL.md"),
    `---
name: other
description: Wrong name. Use when never.
---

Body.
`,
  );
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /overlay skill mismatch.*name="other"/);

  // A full SKILL.md overlay must have frontmatter and an effective name.
  write(path.join(fixture, "overlays", "demo", "SKILL.md"), "No frontmatter.\n");
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /overlay skill missing frontmatter: overlays\/demo\/SKILL.md/);

  write(
    path.join(fixture, "overlays", "demo", "SKILL.md"),
    `---
description: Overlay body. Use when testing overlays.
---

Body.
`,
  );
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /overlay skill missing name: overlays\/demo\/SKILL.md/);

  // frontmatter.yaml contributes to the effective replacement document.
  write(
    path.join(fixture, "overlays", "demo", "frontmatter.yaml"),
    "  name: demo\ndisable-model-invocation: true\n",
  );
  result = runHealth(fixture);
  assert.equal(result.status, 0, `effective overlay name failed:\n${result.stderr}`);
  fs.unlinkSync(path.join(fixture, "overlays", "demo", "SKILL.md"));

  // $ed-workflow route.
  write(
    path.join(fixture, "Skills", "demo", "SKILL.md"),
    `---
name: demo
description: Demo. Use when testing; Not for other.
---

Next: $ed-workflow
`,
  );
  result = runHealth(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\$ed-workflow/);

  console.log("Skill-health unit tests passed.");
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
