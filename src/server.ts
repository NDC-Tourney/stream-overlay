import index from "./index.html";
import dashboard from "./dashboard/dashboard.html";
import {
  settingsMessageSchema,
  type SettingsMessage,
} from "./schemas/settings";
import { isProduction } from "./util";
import { parseArgs } from "util";
import type { HTMLBundle } from "bun";

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

async function overrideHtmlEtags(htmlFiles: HTMLBundle[], value: string) {
  htmlFiles.forEach((htmlFile) =>
    htmlFile.files?.forEach((file) => {
      if (file.loader === "html") {
        file.headers.etag = value;
      }
    }),
  );
}

declare var BUILD_TIME_ETAG: string;

async function run() {
  let lastSettings: SettingsMessage | null = null;

  // Bun.build does not seem to change the etag header on changing the hash part
  // of asset filenames because the content of the original HTML file didn't
  // change, leading to 404s, so instead we inject our own at build time
  if (typeof BUILD_TIME_ETAG !== "undefined") {
    await overrideHtmlEtags([index, dashboard], BUILD_TIME_ETAG);
  }

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
