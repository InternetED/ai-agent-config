#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyOverlays, mergeFrontmatter } from "./overlays.mjs";

function write(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-agent-config-overlays-"));

try {
  const skillsRoot = path.join(temporaryRoot, "Skills");
  const overlaysRoot = path.join(temporaryRoot, "overlays");

  write(
    path.join(skillsRoot, "demo-skill", "SKILL.md"),
    `---
name: demo-skill
description: Demo skill for overlay tests.
---

Body line one.
`,
  );
  write(
    path.join(overlaysRoot, "demo-skill", "frontmatter.yaml"),
    "disable-model-invocation: true\n",
  );
  write(
    path.join(overlaysRoot, "demo-skill", "reference.md"),
    "# Overlay reference\n\nLoaded after sync.\n",
  );

  const result = applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot });
  assert.deepEqual(result.skills, ["demo-skill"]);
  assert.equal(result.frontmatterMerges, 1);
  assert.equal(result.filesCopied, 1);

  const skillText = fs.readFileSync(path.join(skillsRoot, "demo-skill", "SKILL.md"), "utf8");
  assert.match(skillText, /^---\nname: demo-skill\n/);
  assert.match(skillText, /disable-model-invocation: true\n/);
  assert.match(skillText, /Body line one\./);
  assert.equal(
    fs.readFileSync(path.join(skillsRoot, "demo-skill", "reference.md"), "utf8"),
    "# Overlay reference\n\nLoaded after sync.\n",
  );

  // Idempotent second apply.
  const second = applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot });
  assert.equal(second.frontmatterMerges, 0);
  assert.equal(second.filesCopied, 1);

  // Full SKILL.md replace then frontmatter.yaml wins on keys.
  write(
    path.join(skillsRoot, "replace-skill", "SKILL.md"),
    `---
name: replace-skill
description: Upstream body.
---

Upstream only.
`,
  );
  write(
    path.join(overlaysRoot, "replace-skill", "SKILL.md"),
    `---
name: replace-skill
description: Local durable body.
disable-model-invocation: false
---

Local durable body.
`,
  );
  write(
    path.join(overlaysRoot, "replace-skill", "frontmatter.yaml"),
    "disable-model-invocation: true\n",
  );
  const replaced = applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot });
  assert.ok(replaced.skills.includes("replace-skill"));
  const replacedText = fs.readFileSync(path.join(skillsRoot, "replace-skill", "SKILL.md"), "utf8");
  assert.match(replacedText, /Local durable body\./);
  assert.match(replacedText, /disable-model-invocation: true/);
  assert.doesNotMatch(replacedText, /Upstream only/);
  fs.rmSync(path.join(overlaysRoot, "replace-skill"), { recursive: true, force: true });
  assert.doesNotMatch(replacedText, /disable-model-invocation: false/);

  // Dry-run must merge against a replacement SKILL.md, just as apply does.
  write(
    path.join(skillsRoot, "dry-run-skill", "SKILL.md"),
    `---
name: dry-run-skill
description: Upstream body.
---

Upstream only.
`,
  );
  write(
    path.join(overlaysRoot, "dry-run-skill", "SKILL.md"),
    `---
name: dry-run-skill
description: Local body.
disable-model-invocation: true
---

Local body.
`,
  );
  write(
    path.join(overlaysRoot, "dry-run-skill", "frontmatter.yaml"),
    "disable-model-invocation: true\n",
  );
  const dryRun = applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot, dryRun: true });
  assert.equal(dryRun.frontmatterMerges, 0);
  const appliedAfterDryRun = applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot });
  assert.equal(appliedAfterDryRun.frontmatterMerges, dryRun.frontmatterMerges);

  // Preflight every operation: an invalid frontmatter overlay cannot leave
  // files from an earlier overlay behind.
  write(
    path.join(skillsRoot, "first-skill", "SKILL.md"),
    `---
name: first-skill
description: First skill.
---

First body.
`,
  );
  write(path.join(overlaysRoot, "first-skill", "reference.md"), "must not copy\n");
  write(
    path.join(skillsRoot, "zz-bad-yaml", "SKILL.md"),
    `---
name: zz-bad-yaml
description: Bad YAML target.
---

Target body.
`,
  );
  write(path.join(overlaysRoot, "zz-bad-yaml", "frontmatter.yaml"), "not valid YAML\n");
  assert.throws(
    () => applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot }),
    /frontmatter.yaml has an unsupported line/,
  );
  assert.equal(fs.existsSync(path.join(skillsRoot, "first-skill", "reference.md")), false);

  // A malformed full SKILL.md is also caught before any overlay file is written.
  fs.rmSync(path.join(overlaysRoot, "zz-bad-yaml"), { recursive: true, force: true });
  write(
    path.join(skillsRoot, "invalid-full-skill", "SKILL.md"),
    `---
name: invalid-full-skill
description: Original body.
---

Original body.
`,
  );
  write(path.join(overlaysRoot, "invalid-full-skill", "SKILL.md"), "No frontmatter.\n");
  write(path.join(overlaysRoot, "invalid-full-skill", "frontmatter.yaml"), "name: invalid-full-skill\n");
  assert.throws(
    () => applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot }),
    /needs YAML frontmatter before overlays can merge/,
  );
  assert.equal(fs.existsSync(path.join(skillsRoot, "first-skill", "reference.md")), false);
  assert.match(
    fs.readFileSync(path.join(skillsRoot, "invalid-full-skill", "SKILL.md"), "utf8"),
    /Original body\./,
  );
  fs.unlinkSync(path.join(overlaysRoot, "invalid-full-skill", "frontmatter.yaml"));
  assert.throws(() => applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot }));
  assert.equal(fs.existsSync(path.join(skillsRoot, "first-skill", "reference.md")), false);
  fs.rmSync(path.join(overlaysRoot, "invalid-full-skill"), { recursive: true, force: true });

  // Missing skill fails loudly.
  write(path.join(overlaysRoot, "missing-skill", "frontmatter.yaml"), "disable-model-invocation: true\n");
  assert.throws(
    () => applyOverlays(temporaryRoot, { skillsRoot, overlaysRoot }),
    /Overlay targets missing skill: missing-skill/,
  );

  // mergeFrontmatter preserves body and quotes when needed.
  const merged = mergeFrontmatter(
    `---
name: x
description: plain
---

Hi.
`,
    { description: "has: colon", "disable-model-invocation": "true" },
    "x/SKILL.md",
  );
  assert.match(merged, /description: "has: colon"/);
  assert.match(merged, /disable-model-invocation: true/);
  assert.match(merged, /Hi\./);

  console.log("Overlay unit tests passed.");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
