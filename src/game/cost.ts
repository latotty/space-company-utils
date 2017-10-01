import xs from 'xstream';

import { DysonCostResources } from './game.interface';
import { dysonSectionsAmount$ } from './constructions';
import { getValueRatios } from '../lib/utils';

export function getDysonSegmentCost(lvl: number): DysonCostResources<number> {
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

export const getDysonSegmentCostStream = (toLvl: number, currentLvl$: xs<number> = xs.of(0)) => {
  return currentLvl$
    .map((currentLvl) => {
      /*
        (lvl = 5, currentlvl = 0) => 5
        (lvl = 5, currentlvl = 2) => 3
        (lvl = 5, currentlvl = 5) => 0
        (lvl = 5, currentlvl = 6) => 0
      */
      const levelAmount = Math.max(toLvl - currentLvl, 0);

      /*
        (lvl = 5, currentlvl = 0) => [1, 2, 3, 4, 5]
        (lvl = 5, currentlvl = 2) => [3, 4, 5]
        (lvl = 5, currentlvl = 5) => []
        (lvl = 5, currentlvl = 6) => []
      */
      const levels = Array.from(Array(levelAmount)).map((_, index) => index + 1 + currentLvl);

      return levels.reduce<DysonCostResources<number>>((state, lvl) => {
        const subCost = getDysonSegmentCost(lvl);
        return {
          titanium: state.titanium + subCost.titanium,
          gold: state.gold + subCost.gold,
          silicon: state.silicon + subCost.silicon,
          meteorite: state.meteorite + subCost.meteorite,
          ice : state.ice  + subCost.ice ,
        };
      }, {
        titanium: 0,
        gold: 0,
        silicon: 0,
        meteorite: 0,
        ice : 0,
      });
    });
};

const dysonRingTotalCost$ = getDysonSegmentCostStream(50);
const dysonSwarmTotalCost$ = getDysonSegmentCostStream(100);
const dysonSphereTotalCost$ = getDysonSegmentCostStream(250);

const dysonRingCurrentCost$ = getDysonSegmentCostStream(50, dysonSectionsAmount$);
const dysonSwarmCurrentCost$ = getDysonSegmentCostStream(100, dysonSectionsAmount$);
const dysonSphereCurrentCost$ = getDysonSegmentCostStream(250, dysonSectionsAmount$);

const dysonSegmentCostRatios$ = getDysonSegmentCostStream(250, xs.of(249))
  .map(({ titanium, gold, silicon, meteorite, ice }) => ([titanium, gold, silicon, meteorite, ice]))
  .map(vals => getValueRatios(vals))
  .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }))
  .remember();

export interface DysonCosts {
  dysonRingTotalCost$: xs<DysonCostResources<number>>;
  dysonSwarmTotalCost$: xs<DysonCostResources<number>>;
  dysonSphereTotalCost$: xs<DysonCostResources<number>>;
  dysonRingCurrentCost$: xs<DysonCostResources<number>>;
  dysonSwarmCurrentCost$: xs<DysonCostResources<number>>;
  dysonSphereCurrentCost$: xs<DysonCostResources<number>>;
  dysonSegmentCostRatios$: xs<DysonCostResources<number>>;
};
export const dysonCosts: DysonCosts = {
  dysonRingTotalCost$,
  dysonSwarmTotalCost$,
  dysonSphereTotalCost$,
  dysonRingCurrentCost$,
  dysonSwarmCurrentCost$,
  dysonSphereCurrentCost$,
  dysonSegmentCostRatios$,
};
