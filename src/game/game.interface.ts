export interface EnergyResource<T> { energy: T };
export interface PlasmaResource<T> { plasma: T };
export interface UraniumResource<T> { uranium: T };
export interface LavaResource<T> { lava: T };
export interface OilResource<T> { oil: T };
export interface MetalResource<T> { metal: T };
export interface GemResource<T> { gem: T };
export interface CharcoalResource<T> { charcoal: T };
export interface WoodResource<T> { wood: T };
export interface SiliconResource<T> { silicon: T };
export interface LunariteResource<T> { lunarite: T };
export interface MethaneResource<T> { methane: T };
export interface TitaniumResource<T> { titanium: T };
export interface GoldResource<T> { gold: T };
export interface SilverResource<T> { silver: T };
export interface HydrogenResource<T> { hydrogen: T };
export interface HeliumResource<T> { helium: T };
export interface IceResource<T> { ice: T };
export interface MeteoriteResource<T> { meteorite: T };
export interface ScienceResource<T> { science: T };
export interface RocketFuelResource<T> { rocketFuel: T };

export interface AllResources<T> extends
  EnergyResource<T>,
  PlasmaResource<T>,
  UraniumResource<T>,
  LavaResource<T>,
  OilResource<T>,
  MetalResource<T>,
  GemResource<T>,
  CharcoalResource<T>,
  WoodResource<T>,
  SiliconResource<T>,
  LunariteResource<T>,
  MethaneResource<T>,
  TitaniumResource<T>,
  GoldResource<T>,
  SilverResource<T>,
  HydrogenResource<T>,
  HeliumResource<T>,
  IceResource<T>,
  MeteoriteResource<T>,
  ScienceResource<T>,
  RocketFuelResource<T>
{}

export interface DysonCostResources<T> extends
  TitaniumResource<T>,
  GoldResource<T>,
  SiliconResource<T>,
  MeteoriteResource<T>,
  IceResource<T>
{}

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
