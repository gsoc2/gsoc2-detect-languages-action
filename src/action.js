const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs").promises;

async function runGsoc2DetectLanguages() {
  const execOptions = {
    listeners: {
      stdout: (data) => {
        core.setOutput("languages", data.toString());
      },
    },
  };

  const args = ["gsoc2@latest", "detect-languages"];
  const runExitCode = await exec.exec("npx", args, execOptions);

  return runExitCode;
}

async function removeNpmrc() {
  try {
    await fs.access(".npmrc");

    core.info("Found .npmrc, deleting from working tree");
    try {
      await fs.unlink(".npmrc");
    } catch (e) {
      core.error(
        `.npmrc exists, but we couldn't remove it.\nThis may result in language detection failing: ${e.message}`
      );
    }
  } catch (e) {
    // Didn't find the .npmrc, so do nothing.
  }
}

async function main() {
  await core.group("Removing .npmrc if exists", removeNpmrc);
  await core.group("Detect Languages", runGsoc2DetectLanguages);
}

main()
  .then(() => {})
  .catch((err) => {
    core.info(`gSOC2 Detect Languages failed: ${err}
    ${err.stack}`);
    core.setOutput("languages", "{}"); // So the error is better
  });
