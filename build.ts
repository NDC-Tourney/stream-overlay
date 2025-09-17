import { $ } from "bun";
// import bunPluginTailwind from "bun-plugin-tailwind";

const targets: Record<string, Bun.Build.Target> = {
  win: "bun-windows-x64",
  linux: "bun-linux-x64",
};

const gitCommit = await $`git rev-parse HEAD`.text();
const buildTime = new Date().toISOString();
const remoteUrl = await $`git config --get remote.origin.url`.text();
const repoUrl = await Bun.fetch(remoteUrl).then((response) => response.url);

const stringifyValues = (obj: Record<string, string>) => {
  const newObj: typeof obj = {};
  for (const key in obj) {
    newObj[key] = JSON.stringify(obj[key]?.trim());
  }
  return newObj;
};

for (const [platform, target] of Object.entries(targets)) {
  await Bun.build({
    // plugins: [bunPluginTailwind],
    entrypoints: ["./src/main.ts"],
    outdir: "./dist",
    env: "PUBLIC_*",
    define: stringifyValues({
      "process.env.NODE_ENV": "production",
      BUILD_TIME: buildTime,
      GIT_COMMIT: gitCommit,
      REPO_URL: repoUrl,
    }),
    compile: {
      target,
      outfile: `${platform}/ndc-stream-overlay`,
    },
    minify: true,
    sourcemap: true,
  });
}

console.log("Build successful :3");
