import { TechType, ResourceType, TechData } from './game.interface';
import { capitalizeFirstLetter } from '../lib/utils';

import { GameWindow } from './game-window.interface';

export const gameWindow: GameWindow = window as any as GameWindow; // type hack

export const techTypes: TechType[] = [
  'unlockStorage', 'unlockBasicEnergy', 'unlockOil', 'unlockSolar',
  'unlockMachines', 'unlockDestruction', 'unlockSolarSystem', 'unlockRocketFuelT2', 'unlockRocketFuelT3',
  'unlockLabT2', 'unlockLabT3', 'unlockLabT4', 'unlockBatteries', 'unlockBatteriesT2', 'unlockBatteriesT3',
  'unlockBatteriesT4', 'unlockPlasma', 'unlockPlasmaTier2', 'unlockPSU', 'unlockPSUT2', 'unlockEmc',
  'unlockMeteorite', 'unlockMeteoriteTier1', 'unlockMeteoriteTier2', 'unlockDyson', 'unlockDysonSphere',
  'upgradeResourceTech', 'upgradeEngineTech', 'upgradeSolarTech', 'efficiencyResearch',
  'scienceEfficiencyResearch', 'energyEfficiencyResearch', 'batteryEfficiencyResearch',
];

export const resourceTypes: ResourceType[] = [
  'energy', 'plasma', 'uranium', 'lava', 'oil',
  'metal', 'gem', 'charcoal', 'wood', 'silicon', 'lunarite',
  'methane', 'titanium', 'gold', 'silver', 'hydrogen', 'helium',
  'ice', 'meteorite', 'science', 'rocketFuel',
];

export const resourceTabSideBarResources: ResourceType[] = [
  'plasma', 'energy', 'uranium', 'lava', 'oil', 'metal', 'gem',
  'charcoal', 'wood', 'silicon', 'lunarite', 'methane', 'titanium',
  'gold', 'silver', 'hydrogen', 'helium', 'ice', 'meteorite',
];

export function getResource(type: ResourceType): number {
  return gameWindow.Game.resources.getResource(type);
}

export function getStorage(type: ResourceType): number {
  return gameWindow.Game.resources.getStorage(type);
}

export function getProduction(type: ResourceType): number {
  return gameWindow.Game.resources.getProduction(type);
}

export function getResourceEmc(type: ResourceType): number {
  return (gameWindow as any)[type + 'EmcVal'];
}

export function getStoragePrice() {
  return gameWindow.storagePrice;
}

export function getDysonAmount() {
  return gameWindow.dyson;
}

export function getTechData(type: TechType): TechData {
  return gameWindow.Game.tech.getTechData(type);
}

export function getTechCost(cost: number, currentLevel: number): number {
  return gameWindow.getCost(cost, currentLevel);
}

export function getDysonCost(lvl: number) {
  const dysonTitaniumCost = Math.floor(300000 * Math.pow(1.02,lvl));
  const dysonGoldCost = Math.floor(100000 * Math.pow(1.02,lvl));
  const dysonSiliconCost = Math.floor(200000 * Math.pow(1.02,lvl));
  const dysonMeteoriteCost = Math.floor(1000 * Math.pow(1.02,lvl));
  const dysonIceCost = Math.floor(100000 * Math.pow(1.02,lvl));
  return {
    titanium: dysonTitaniumCost,
    gold: dysonGoldCost,
    silicon: dysonSiliconCost,
    meteorite: dysonMeteoriteCost,
    ice: dysonIceCost,
  };
}

export function format(num: number) { return gameWindow.Game.settings.format(num); }

export function getCost(id: string) {
  const type = getResourceTypeFromId(id);
  switch (id) {
    case 'unlockDysonResearchPlasmaCost': return 10000;
    case 'unlockDysonResearchEnergyCost': return 100000;
    case 'unlockEmcResearchPlasmaCost': return 100;
    case 'unlockEmcResearchEnergyCost': return 75000;
    case 'unlockPlasmaResearchWoodCost': return 15000;
    case 'unlockPlasmaResearchOilCost': return 15000;
    case 'unlockPlasmaResearchUraniumCost': return 1500;
    case 'unlockPlasmaResearchHydrogenCost': return 1500;
    case 'sphereRocketFuelCost': return 1000000;
    case 'swarmRocketFuelCost': return 250000;
    case 'ringRocketFuelCost': return 50000;
    case 'commsWonderGoldCost': return 6000000;
    case 'commsWonderSiliconCost': return 10000000;
    case 'commsWonderIceCost': return 6000000;
    case 'rocketWonderLunariteCost': return 8000000;
    case 'rocketWonderTitaniumCost': return 6000000;
    case 'rocketWonderMetalCost': return 12000000;
    case 'antimatterWonderUraniumCost': return 6000000;
    case 'antimatterWonderLavaCost': return 10000000;
    case 'antimatterWonderOilCost': return 8000000;
    case 'antimatterWonderMethaneCost': return 6000000;
    case 'portalMeteoriteCost': return 500000;
    case 'portalHeliumCost': return 8000000;
    case 'portalSiliconCost': return 6000000;
    case 'stargateWonderPlasmaCost': return 500000;
    case 'stargateWonderSiliconCost': return 920000000;
    case 'stargateWonderMeteoriteCost': return 17000000;
    case 'lunariteStorageMetalCost': return getStorage('lunarite') * 4 * getStoragePrice();
    case 'meteoriteStorageLunariteCost': return getStorage('meteorite') * 4 * getStoragePrice();
  }

  if (id.endsWith('StorageCost')) {
    return getStorage(type) * getStoragePrice();
  }
  if (id.endsWith(`Storage${ capitalizeFirstLetter(type) }Cost`)) {
    const costType: ResourceType = id.replace(`Storage${ capitalizeFirstLetter(type) }Cost`, '') as ResourceType;
    return getStorage(costType) / 2.5 * getStoragePrice();
  }
  if (id.includes('Research')) {
    const tech = getTechData(id.replace('Cost', '') as TechType);
    if (!tech) { console.error(id, type); }
    return tech && gameWindow.getCost(tech.cost.science!, tech.current) || 0;
  }
  if ((window as any)[id] instanceof Element) {
    return 0;
  }
  return (window as any)[id];
}

export function getResourceTypeFromId(id: string): ResourceType {
  const type = (() => {
    if (id.endsWith('StorageCost')) {
      return id.replace('StorageCost', '');
    }
    if (id.endsWith('Cost')) {
      const match = /([A-Z][a-z]+)Cost$/.exec(id);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return '';
  })();
  switch (type) {
    case 'research': return 'science';
    case 'fuel': return 'rocketFuel';
    default: return type as ResourceType;
  }
}

export function getResourceTabRowByType(type: ResourceType) {
  const rowId = `${type}Nav`;
  const $resourceNavParent = document.getElementById('resourceNavParent')!;
  const $row = $resourceNavParent.querySelector(`#${rowId}`);
  if (!$row) {
    throw new Error(`getResourceTabRowByType cannot find ${type}`);
  }
  return $row as HTMLTableRowElement;
}
