import index from "./index.html";
import dashboard from "./dashboard/dashboard.html";
import {
  settingsMessageSchema,
  type SettingsMessage,
} from "./schemas/settings";
import open from "open";
import { parseArgs } from "util";

const args = parseArgs({
  args: process.argv,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
    host: {
      type: "string",
      // only localhost is whitelisted for the huismetbenen API (CORS) right now
      default: "localhost",
    },
    port: {
      type: "string",
      default: "7270",
      short: "p",
    },
  },
  strict: true,
  allowPositionals: true,
}).values;

if (args.help) {
  console.log(`ndc-overlay [--host localhost] [-p|--port 7270]`);
  process.exit();
}

let lastSettings: SettingsMessage | null = null;

const server = Bun.serve({
  hostname: args.host,
  port: args.port,
  routes: {
    "/dashboard": dashboard,
    "/ws": (req, server) => {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 400 });
    },
    "/*": index,
  },
  websocket: {
    open(ws) {
      console.log(`client has connected`);
      ws.subscribe("settings");
      if (lastSettings) {
        ws.send(JSON.stringify(lastSettings));
      }
    },
    close(ws) {
      console.log(`client has disconnected`);
      ws.unsubscribe("settings");
    },
    message(ws, message) {
      try {
        const parsedMessage = settingsMessageSchema.parse(
          JSON.parse(message.toString()),
        );
        ws.publish("settings", JSON.stringify(parsedMessage));
        lastSettings = parsedMessage;
      } catch (e) {
        console.error(
          "failed to forward settings sent by either overlay or dashboard:",
          e,
        );
      }
    },
    idleTimeout: 30,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(
  `Server listening on ${server.url}\nDashboard listening on ${new URL("dashboard", server.url)}`,
);

const overlayUrl = server.url.toString();
const dashboardUrl = new URL("dashboard", server.url).toString();

if (process.env.NODE_ENV === "production") {
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
