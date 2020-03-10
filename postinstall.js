"use strict";

const fs = require("fs");
const path = require("path");

let platformSpecificPackagePath;
if (process.platform === "win32" && process.arch === "x64") {
  platformSpecificPackagePath = require.resolve("@financial-times/sass-windows-x64");
} else if (process.platform === "win32" && process.arch === "ia32") {
  platformSpecificPackagePath = require.resolve("@financial-times/sass-windows-ia32");
} else if (process.platform === "darwin") {
  platformSpecificPackagePath = require.resolve("@financial-times/sass-macos-x64");
} else if (process.platform === "linux" && process.arch === "x64") {
  platformSpecificPackagePath = require.resolve("@financial-times/sass-linux-x64");
} else if (process.platform === "linux" && process.arch === "ia32") {
  platformSpecificPackagePath = require.resolve("@financial-times/sass-linux-ia32");
} else {
  throw new Error(
    "@financial-times/sass does not have a precompiled binary for the platform/architecture you are using. Please contact Origami or open an issue on https://github.com/Financial-Times/sass/issues"
  );
}

const platformSpecificSassPath = path.join(path.dirname(platformSpecificPackagePath), 'dart-sass')

// We need to remove the sass entrypoint file if it exists already.
if (fs.existsSync(path.join(__dirname, './sass'))) {
  fs.unlinkSync(path.join(__dirname, './sass'));
}

// Create our own sass entrypoint which uses absolute paths to the dartvm and snapshot.
// This will ensure it works when symlinked to, which the entrypoint file in dart-sass
// does not support on macos.
fs.writeFileSync(path.join(__dirname, 'sass'), `
#!/bin/sh
exec "${path.join(platformSpecificSassPath, '/src/dart')}" "${path.join(platformSpecificSassPath, '/src/sass.dart.snapshot')}" "$@"
`, {
  encoding: 'utf-8',
  mode: 0o777
})
