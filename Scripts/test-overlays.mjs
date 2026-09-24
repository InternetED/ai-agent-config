#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyOverlays, mergeFrontmatter } from "./overlays.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");

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

  // Live repo overlays for wait-what / loop-me exist and only use frontmatter.
  for (const name of ["wait-what", "loop-me"]) {
    const overlayDir = path.join(packageRoot, "overlays", name);
    assert.equal(fs.existsSync(path.join(overlayDir, "frontmatter.yaml")), true, `${name} overlay missing`);
    const names = fs.readdirSync(overlayDir);
    assert.deepEqual(names, ["frontmatter.yaml"]);
  }

  console.log("Overlay unit tests passed.");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
