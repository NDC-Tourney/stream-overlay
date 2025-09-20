import { Updater } from "./updater";
import { Server } from "./server";
import { isProduction } from "./util";
import open from "open";

if (isProduction) {
  await Updater.checkAndApplyUpdates();
}

const server = await Server.run();
console.log(
  `Server listening on ${server.url}\nDashboard listening on ${new URL("dashboard", server.url)}`,
);

const overlayUrl = server.url.toString();
const dashboardUrl = new URL("dashboard", server.url).toString();

if (isProduction) {
  open(dashboardUrl);
}

process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
process.stdin.removeAllListeners();
process.stdin.on("readable", () => {
  for (const chunk of process.stdin.read() as string) {
    switch (chunk) {
      case "o":
        console.log("Opening overlay in browser...");
        open(overlayUrl);
        break;
      case "d":
        console.log("Opening dashboard in browser...");
        open(dashboardUrl);
        break;
      case "b":
        console.log("Opening both overlay and dashboard in browser...");
        open(overlayUrl);
        open(dashboardUrl);
        break;
      case "q":
      case "\u0003": // Ctrl-C
        console.log("Quitting...");
        process.exit();
    }
  }
});

console.log(
  `
  Press [o] to open the overlay
  Press [d] to open the dashboard
  Press [b] to open both

  Press [q] to quit
`,
);
