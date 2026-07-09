import fs from "node:fs";

if (process.platform === "win32") {
  const originalNativeRealpath = fs.realpathSync.native.bind(fs.realpathSync);
  let patched = false;

  fs.realpathSync.native = (...args) => {
    if (!patched) {
      patched = true;
      const error = new Error("EISDIR: illegal operation on a directory, realpath");
      error.code = "EISDIR";
      throw error;
    }

    return originalNativeRealpath(...args);
  };
}
