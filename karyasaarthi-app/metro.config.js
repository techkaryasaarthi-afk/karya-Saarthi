const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro's package-exports resolver is misreading some React Navigation
// package metadata on Windows in this project. Falling back to classic
// resolution avoids the warnings and broken module lookup.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
