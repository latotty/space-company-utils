import xs from 'xstream';

import { DysonCostResources } from './game.interface';
import { getValueRatios } from '../lib/utils';

export function getDysonCost(lvl: number): DysonCostResources<number> {
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

export const dysonCostRatios$ = xs.of(getDysonCost(250))
  .map(({ titanium, gold, silicon, meteorite, ice }) => ([titanium, gold, silicon, meteorite, ice]))
  .map(vals => getValueRatios(vals))
  .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }))
  .remember();
