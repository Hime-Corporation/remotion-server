import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((config) => {
  return enableTailwind(config);
});

// Use system Chromium for ARM64 compatibility
Config.setBrowserExecutable("/usr/bin/chromium");
