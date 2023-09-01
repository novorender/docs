const path = require("path");
const dts = require("dts-bundle");

/** Merge and bundle web_api's dts files into a single dts file */
dts.bundle({
  name: "@novorender/api",
  main: "ts/dist/types/index.d.ts",
  out: path.join(process.cwd(), "static/web_api.d.ts"),
});
