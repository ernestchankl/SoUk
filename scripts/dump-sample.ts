import { writeFileSync } from "node:fs";
import { buildGeneratedSampleMatch } from "../src/lib/sample.ts";

const match = buildGeneratedSampleMatch();
writeFileSync("/workspace/src/lib/sample-match.json", JSON.stringify(match));
console.log("actions", match.actions.length);
console.log("bytes", Buffer.byteLength(JSON.stringify(match)));
