import { $ } from "bun";
import bunPluginTailwind from "bun-plugin-tailwind";
import type { JSONType } from "node_modules/zod/v4/core/util.d.cts";

const targets: Record<string, Bun.Build.Target> = {
  win: "bun-windows-x64",
  linux: "bun-linux-x64",
};

const buildTime = Date.now();
const buildTimeEtag = buildTime.toString(36);
console.log("build time:", new Date(buildTime), buildTime);

const gitCommit = await $`git rev-parse HEAD`.text().then((s) => s.trim());
console.log("git commit:", gitCommit);

const stringifyValues = (obj: Record<string, JSONType>) => {
  const newObj: Record<string, string> = {};
  for (const key in obj) {
    newObj[key] = JSON.stringify(obj[key]);
  }
  return newObj;
};

for (const [platform, target] of Object.entries(targets)) {
  await Bun.build({
    plugins: [
      bunPluginTailwind,
      {
        name: "hooks",
        setup(build) {
          build.onEnd((result) => {
            if (result.success) {
              console.log(`✅ Build for ${platform} (${target}) successful :3`);
            } else {
              console.log(
                `❌ Build for ${platform} (${target}) failed with ${result.logs.length} errors :c\n`,
                result.logs,
              );
            }
          });
        },
      },
    ],
    entrypoints: ["./src/main.ts"],
    outdir: "./dist",
    env: "PUBLIC_*",
    define: stringifyValues({
      "process.env.NODE_ENV": "production",
      BUILD_TIME: buildTime,
      BUILD_TIME_ETAG: buildTimeEtag,
      GIT_COMMIT: gitCommit,
    }),
    compile: {
      target,
      outfile: `${platform}/ndc-stream-overlay`,
    },
    minify: true,
    sourcemap: true,
  });
}
