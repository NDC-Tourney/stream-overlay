import { UpdateManager, VelopackApp } from "velopack";

let currentVersion;

async function checkAndApplyUpdates() {
  VelopackApp.build().run();

  const REPO_URL = "https://github.com/NDC-Tourney/tourney-dash";
  const UPDATE_URL = `${REPO_URL}/releases/latest/download/`;

  try {
    const updateManager = new UpdateManager(UPDATE_URL);

    const newVersion = await updateManager.checkForUpdatesAsync();

    if (newVersion) {
      console.log("Update found! Downloading...");
      await updateManager.downloadUpdateAsync(newVersion);

      console.log("Update downloaded. Restarting...");
      updateManager.waitExitThenApplyUpdate(newVersion, false, true);
      process.exit(0);
    }

    currentVersion = updateManager.getCurrentVersion();
  } catch (e) {
    console.error("Update checking failed:", (e as Error).message);
  }
}

export const Updater = {
  checkAndApplyUpdates,
  currentVersion,
};
