import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faIndustry,
  faCogs,
  faBolt,
  faCubes,
  faFlask,
  faBox,
  faWarehouse,
  faOilCan,
  faAtom,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';

/**
 * Maps icon name strings from the backend to FontAwesome icon definitions
 */
const iconMap: Record<string, IconDefinition> = {
  'industry': faIndustry,
  'cogs': faCogs,
  'bolt': faBolt,
  'cubes': faCubes,
  'flask': faFlask,
  'box': faBox,
  'warehouse': faWarehouse,
  'oil-can': faOilCan,
  'atom': faAtom,
  'network-wired': faNetworkWired,
};

export function getIconByName(iconName: string): IconDefinition {
  return iconMap[iconName] || faCogs; // Default to cogs if icon not found
}

