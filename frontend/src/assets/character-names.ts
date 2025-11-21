// Import PORTRAITS for the mapping
import { PORTRAITS } from './portrait-constnats';

// Character names mapped to their portrait paths (must match PORTRAITS order)
export const CHARACTER_NAMES: string[] = [
  'Absa',
  'Clairen',
  'Etalus',
  'Fleet',
  'Forsburn',
  'Galvan',
  'Kragg',
  'Loxodont',
  'Maypul',
  'Olympia',
  'Orcane',
  'Wrastor',
  'Zetterburn',
  'Ranno',
];

// Map portrait path to character name
export function getCharacterName(portraitPath: string): string {
  const index = PORTRAITS.indexOf(portraitPath);
  if (index >= 0 && index < CHARACTER_NAMES.length) {
    return CHARACTER_NAMES[index];
  }
  // Fallback: extract name from path
  return portraitPath
    .replace('/portraits/240px-RoA2_Icon_', '')
    .replace('StockIcon.webp', '');
}

