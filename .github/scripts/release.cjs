const fs = require('node:fs');

module.exports = async ({ github, context, core }) => {
  const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Automatic releases require a stable semantic version: ${version}`);
  }
  const tag = `v${version}`;
  const repo = context.repo;
  let release;
  try {
    release = (await github.rest.repos.getReleaseByTag({ ...repo, tag })).data;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  if (release) {
    if (release.draft || release.prerelease) {
      throw new Error(`${tag} already exists as a draft or prerelease; resolve it manually`);
    }
    core.info(`${tag} is already published; skipping`);
    return;
  }

  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const section = changelog.split(/^## /m).find((entry) => entry.startsWith(`[${version}] - `));
  const notes = section?.slice(section.indexOf('\n') + 1).trim();
  if (!notes) throw new Error(`CHANGELOG.md has no release notes for ${version}`);

  let ref;
  try {
    ref = (await github.rest.git.getRef({ ...repo, ref: `tags/${tag}` })).data;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  if (ref) {
    let object = ref.object;
    while (object.type === 'tag') {
      object = (await github.rest.git.getTag({ ...repo, tag_sha: object.sha })).data.object;
    }
    if (object.type !== 'commit' || object.sha !== context.sha) {
      throw new Error(`${tag} already points elsewhere; refusing to move an existing tag`);
    }
  }

  const published = await github.rest.repos.createRelease({
    ...repo,
    tag_name: tag,
    target_commitish: context.sha,
    name: tag,
    body: notes,
    draft: false,
    prerelease: false,
  });
  core.info(`Published ${published.data.html_url}`);
};
