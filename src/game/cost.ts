import xs from 'xstream';

import { DysonCostResources, AllResources, DysonContructions } from './game.interface';
import { dysonSectionsAmount$ } from './constructions';
import { getValueRatios } from '../lib/utils';

export function getProduceTimeSecForCost<T extends Partial<AllResources<number>>>(
  costs: T,
  productions: T,
  currentAmounts?: T,
): T {
  return Object.keys(costs).reduce((state: any, key) => {
    const production: number = (productions as any)[key];
    const cost: number = (costs as any)[key];
    const currentAmount: number = currentAmounts && (currentAmounts as any)[key] || 0;
    const remainingCost = Math.max(cost - currentAmount, 0);
    const produceTime = remainingCost > 0 && production > 0 && remainingCost / production || 0;
    return {
      ...state,
      [key]: produceTime,
    };
  }, {} as T);
}

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

const getDysonSegmentCostStream = (toLvl: number, currentLvl$: xs<number> = xs.of(0)) => {
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

const dysonSegmentCostRatios$ = getDysonSegmentCostStream(250, xs.of(249))
  .map(({ titanium, gold, silicon, meteorite, ice }) => ([titanium, gold, silicon, meteorite, ice]))
  .map(vals => getValueRatios(vals))
  .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }))
  .remember();

export interface DysonContructionCosts {
  totalCost$: xs<DysonCostResources<number>>;
  currentCost$: xs<DysonCostResources<number>>;
}

export interface DysonCosts {
  constructions: DysonContructions<DysonContructionCosts>;
  dysonSegmentCostRatios$: xs<DysonCostResources<number>>;
};

export const dysonCosts: DysonCosts = {
  constructions: {
    ring: {
      totalCost$: getDysonSegmentCostStream(50),
      currentCost$: getDysonSegmentCostStream(50, dysonSectionsAmount$),
    },
    swarm: {
      totalCost$: getDysonSegmentCostStream(100),
      currentCost$: getDysonSegmentCostStream(100, dysonSectionsAmount$),
    },
    sphere: {
      totalCost$: getDysonSegmentCostStream(250),
      currentCost$: getDysonSegmentCostStream(250, dysonSectionsAmount$),
    },
  },
  dysonSegmentCostRatios$,
};
