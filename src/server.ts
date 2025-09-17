import index from "./index.html";
import dashboard from "./dashboard/dashboard.html";
import {
  settingsMessageSchema,
  type SettingsMessage,
} from "./schemas/settings";
import { isProduction } from "./util";
import { parseArgs } from "util";
import open from "open";

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

function run() {
  let lastSettings: SettingsMessage | null = null;

  return Bun.serve({
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
    development: !isProduction && {
      hmr: true,
      console: true,
    },
  });
}

export const Server = { run };
