import fs from "fs";
import path from "path";

const distPath = path.resolve("dist");

fs.readdirSync(distPath).forEach((file) => {
  if (file.endsWith(".js")) {
    fs.renameSync(
      path.join(distPath, file),
      path.join(distPath, file.replace(".js", ".mjs"))
    );
  }
});
