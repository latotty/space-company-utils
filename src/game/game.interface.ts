export interface AllResources<T> {
  energy: T;
  plasma: T;
  uranium: T;
  lava: T;
  oil: T;
  metal: T;
  gem: T;
  charcoal: T;
  wood: T;
  silicon: T;
  lunarite: T;
  methane: T;
  titanium: T;
  gold: T;
  silver: T;
  hydrogen: T;
  helium: T;
  ice: T;
  meteorite: T;
  science: T;
  rocketFuel: T;
}

export interface TechData {
  current: number;
  cost: Partial<AllResources<number>>;
}

export type TechType = 'unlockStorage' | 'unlockBasicEnergy' | 'unlockOil' | 'unlockSolar' |
  'unlockMachines' | 'unlockDestruction' | 'unlockSolarSystem' | 'unlockRocketFuelT2' | 'unlockRocketFuelT3' |
  'unlockLabT2' | 'unlockLabT3' | 'unlockLabT4' | 'unlockBatteries' | 'unlockBatteriesT2' | 'unlockBatteriesT3' |
  'unlockBatteriesT4' | 'unlockPlasma' | 'unlockPlasmaTier2' | 'unlockPSU' | 'unlockPSUT2' | 'unlockEmc' |
  'unlockMeteorite' | 'unlockMeteoriteTier1' | 'unlockMeteoriteTier2' | 'unlockDyson' | 'unlockDysonSphere' |
  'upgradeResourceTech' | 'upgradeEngineTech' | 'upgradeSolarTech' | 'efficiencyResearch' |
  'scienceEfficiencyResearch' | 'energyEfficiencyResearch' | 'batteryEfficiencyResearch';

export type ResourceType = 'energy' | 'plasma' | 'uranium' | 'lava' | 'oil' |
  'metal' | 'gem' | 'charcoal' | 'wood' | 'silicon' | 'lunarite' |
  'methane' | 'titanium' | 'gold' | 'silver' | 'hydrogen' | 'helium' |
  'ice' | 'meteorite' | 'science' | 'rocketFuel';
