const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');
const rnPopupPackage = path.resolve(root, '..', 'rn-popup');
const projectNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(root, 'node_modules');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

config.resolver.unstable_enablePackageExports = true;
config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), rnPopupPackage])
);
config.resolver.blockList = undefined;
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [projectNodeModules, rootNodeModules];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@bashem/rn-popup': rnPopupPackage,
  react: path.join(projectNodeModules, 'react'),
  'react-native': path.join(rootNodeModules, 'react-native'),
};

module.exports = config;
