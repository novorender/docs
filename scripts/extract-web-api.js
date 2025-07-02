const path = require("path");
const fs = require("node:fs");

let content = fs.readFileSync(
    path.join(process.cwd(), "@novorender/dist/novorender-api.d.ts"),
    "utf-8"
);
content = `declare module "@novorender/api" {\n${content}\n}`;
fs.writeFileSync(path.join(process.cwd(), "static/web_api.d.ts"), content);
