import { ResourceType, TechType, TechData } from './game.interface';

export interface GameWindow {
  Game: Game;

  getCost(basePrice: number, amount: number, multiplier?: number): number;

  dyson: number;

  storagePrice: number;
}

interface Game {
  resources: GameResources;
  settings: GameSettings;
  tech: GameTech;
}

interface GameResources {
  getResource(type: ResourceType): number;
  getStorage(type: ResourceType): number;
  getProduction(type: ResourceType): number;
}

interface GameSettings {
  format(num: number): string;
}

interface GameTech {
  getTechData(techType: TechType): TechData;
}
