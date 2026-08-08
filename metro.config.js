const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
  // `light`/`dark` sont inclus par défaut par Uniwind ; les thèmes visuels
  // prédéfinis de la Phase 1.7 (src/features/settings/constants.ts) sont
  // des thèmes à part entière, pas une variation de light/dark — Uniwind
  // ne les découvre pas tout seul depuis les `@variant` du CSS, il faut
  // les déclarer ici pour que `src/uniwind-types.d.ts` soit régénéré avec.
  extraThemes: ['sauge', 'corail', 'lavande', 'ocre'],
});
