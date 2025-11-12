import open from "open";
import { Server } from "./server";
import { Updater } from "./updater";
import { isProduction } from "./util";

if (isProduction) {
  await Updater.checkAndApplyUpdates();
}

const server = await Server.run();
console.log(
  `Server listening on ${server.url}\nDashboard listening on ${new URL("dashboard", server.url)}`,
);

const overlayUrl = server.url.toString();
const dashboardUrl = new URL("dashboard", server.url).toString();

if (isProduction && process.env.OPEN_DASHBOARD_URL !== "false") {
  open(dashboardUrl);
}

process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
process.stdin.removeAllListeners();
process.stdin.on("readable", () => {
  for (const chunk of process.stdin.read() as string) {
    switch (chunk) {
      case "d":
        console.log("Opening dashboard in browser...");
        open(dashboardUrl);
        break;
      case "o":
        console.log("Opening overlay in browser...");
        open(overlayUrl);
        break;
      case "b":
        console.log("Opening both overlay and dashboard in browser...");
        open(dashboardUrl);
        open(overlayUrl);
        break;
      case "q":
      case "\u0003": // Ctrl-C
        console.log("Quitting...");
        process.exit();
    }
  }
});

console.log(`
  Welcome to tourney!dash :3

  Press [d] to open the dashboard
  Press [o] to open the overlay
  Press [b] to open both

  Press [q] to quit
`);
