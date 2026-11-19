const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const resolve = config.resolver.resolveRequest || ((context, name, platform) => context.resolveRequest(context, name, platform));
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // A versão 1.x usa internamente o sufixo .js, mas exporta o módulo como "crypto".
  const name = moduleName === '@noble/hashes/crypto.js' ? '@noble/hashes/crypto' : moduleName;
  return resolve(context, name, platform);
};
module.exports = config;
