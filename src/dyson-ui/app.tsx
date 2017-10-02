import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';

import { format } from '../game/api';
import { DysonCostResources, ResourceType, DysonContructions } from '../game/game.interface';
import { AllResourceStreams } from '../game/resources';
import { DysonCosts, getProduceTimeSecForCost, DysonContructionCosts } from '../game/cost';
import { getValueRatios, capitalizeFirstLetter, getPercent, toHHMMSS } from '../lib/utils';

export interface Sources {
  DOM: DOMSource;
  allResourceStreams: AllResourceStreams;
  dysonCosts: DysonCosts;
  onion: StateSource<State>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  onion: Stream<Reducer>;
}

export interface Reducer {
  (prev: State): State;
}

export interface State {
  currentProductions: DysonCostResources<number>;
  currentProductionRatios: DysonCostResources<number>;
  dysonCostRatios: DysonCostResources<number>;
  worstProduction?: ResourceType;
  dysonContructions: DysonContructions<DysonContructionsState>;
}

interface DysonContructionsState {
  totalCost: DysonCostResources<number>;
  currentCost: DysonCostResources<number>;
  totalProduceTimeSec: DysonCostResources<number>;
  currentProduceTimeSec: DysonCostResources<number>;
}

export interface Actions {
  currentProductionsChange$: xs<DysonCostResources<number>>;
  currentAmountChange$: xs<DysonCostResources<number>>;
}

export function App(sources: Sources): Sinks {
  const actions = intent(
    sources.allResourceStreams,
  );
  const reducer$ = model(actions, sources.dysonCosts);
  const vdom$ = view(sources.onion.state$);

  return {
    DOM: vdom$,
    onion: reducer$,
  };
}

function intent(
  allResourceStreams: AllResourceStreams,
): Actions {
  const currentProductionsChange$ = xs.combine(
      allResourceStreams.titanium.production$,
      allResourceStreams.gold.production$,
      allResourceStreams.silicon.production$,
      allResourceStreams.meteorite.production$,
      allResourceStreams.ice.production$,
    )
    .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }));

  const currentAmountChange$ = xs.combine(
      allResourceStreams.titanium.amount$,
      allResourceStreams.gold.amount$,
      allResourceStreams.silicon.amount$,
      allResourceStreams.meteorite.amount$,
      allResourceStreams.ice.amount$,
    )
    .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }));

  return {
    currentProductionsChange$,
    currentAmountChange$,
  };
}

function model(actions: Actions, dysonCosts: DysonCosts): Stream<Reducer> {
  const dysonCostRatiosChange$ = dysonCosts.dysonSegmentCostRatios$;

  const currentProductionRatiosChange$ = actions.currentProductionsChange$
    .map(({ titanium, gold, silicon, meteorite, ice }) => {
      const [
        titaniumRatio, goldRatio, siliconRatio, meteoriteRatio, iceRatio
      ] = getValueRatios([titanium, gold, silicon, meteorite, ice]);
      return {
        titanium: titaniumRatio,
        gold: goldRatio,
        silicon: siliconRatio,
        meteorite: meteoriteRatio,
        ice: iceRatio
      };
    });

  const initReducer$ = xs.of<Reducer>((prev: State) => {
    const initDysonCostResources = () => ({
      titanium: 0,
      gold: 0,
      silicon: 0,
      meteorite: 0,
      ice: 0,
    });
    const state: State = {
      currentProductions: initDysonCostResources(),
      currentProductionRatios: initDysonCostResources(),
      dysonCostRatios: initDysonCostResources(),
      dysonContructions: {
        ring: {
          totalCost: initDysonCostResources(),
          currentCost: initDysonCostResources(),
          totalProduceTimeSec: initDysonCostResources(),
          currentProduceTimeSec: initDysonCostResources(),
        },
        swarm: {
          totalCost: initDysonCostResources(),
          currentCost: initDysonCostResources(),
          totalProduceTimeSec: initDysonCostResources(),
          currentProduceTimeSec: initDysonCostResources(),
        },
        sphere: {
          totalCost: initDysonCostResources(),
          currentCost: initDysonCostResources(),
          totalProduceTimeSec: initDysonCostResources(),
          currentProduceTimeSec: initDysonCostResources(),
        },
      },
    };
    return prev || state;
  });

  const dysonRing$ = dysonContructionStateStream(
    dysonCosts.constructions.ring,
    actions.currentProductionsChange$,
    actions.currentAmountChange$
  );
  const dysonSwarm$ = dysonContructionStateStream(
    dysonCosts.constructions.swarm,
    actions.currentProductionsChange$,
    actions.currentAmountChange$
  );
  const dysonSphere$ = dysonContructionStateStream(
    dysonCosts.constructions.sphere,
    actions.currentProductionsChange$,
    actions.currentAmountChange$
  );

  const dysonContructionsReducer$ = xs.combine(dysonRing$, dysonSwarm$, dysonSphere$)
    .map(([ring, swarm, sphere]) => ({ ring, swarm, sphere }))
    .map<Reducer>(mapStreamToReducer('dysonContructions'));

  const worstProductionReducer$ = xs.combine(currentProductionRatiosChange$, dysonCostRatiosChange$)
    .map(([curr, cost]) => getWorstProduction(curr, cost))
    .map<Reducer>(mapStreamToReducer('worstProduction'));

    const currentProductionsReducer$ = actions.currentProductionsChange$
    .map<Reducer>(currentProductions => prev => {
      return {
        ...prev,
        currentProductions: { ...currentProductions },
      };
    });

  const currentDysonProductionReducer$ = currentProductionRatiosChange$
    .map<Reducer>(currentProductionRatios => prev => {
      return {
        ...prev,
        currentProductionRatios: { ...currentProductionRatios },
      };
    });

  const dysonCostRatiosReducer$ = dysonCosts.dysonSegmentCostRatios$
    .map<Reducer>(dysonCostRatios => prev => {
      return {
        ...prev,
        dysonCostRatios: { ...dysonCostRatios },
      };
    });

  return xs.merge(
    initReducer$,
    currentProductionsReducer$,
    currentDysonProductionReducer$,
    dysonCostRatiosReducer$,
    worstProductionReducer$,
    dysonContructionsReducer$,
  );
}

function dysonContructionStateStream(
  constuctionCosts: DysonContructionCosts,
  currentProductionsChange$: xs<DysonCostResources<number>>,
  currentAmountChange$: xs<DysonCostResources<number>>,
): xs<DysonContructionsState> {
  const dysonRingTotalProduceTimeSec$ = xs.combine(
      constuctionCosts.totalCost$,
      currentProductionsChange$,
    )
    .map(([cost, production]) => {
      return getProduceTimeSecForCost(cost, production);
    });

    const dysonRingCurrentProduceTimeSec$ = xs.combine(
      constuctionCosts.currentCost$,
      currentProductionsChange$,
      currentAmountChange$,
    )
    .map(([cost, production, amount]) => {
      return getProduceTimeSecForCost(cost, production, amount);
    });

  return xs.combine(
      constuctionCosts.totalCost$,
      constuctionCosts.currentCost$,
      dysonRingTotalProduceTimeSec$,
      dysonRingCurrentProduceTimeSec$,
    )
    .map(([
      totalCost, currentCost, totalProduceTimeSec, currentProduceTimeSec,
    ]) => ({
      totalCost, currentCost, totalProduceTimeSec, currentProduceTimeSec,
    }));
}

function mapStreamToReducer<TState extends {}>(key: keyof TState) {
  return (value: {}) => (prev: TState) => Object.assign({}, prev, { [key]: value });
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map(({
    currentProductions, currentProductionRatios,
    dysonCostRatios, worstProduction,
    dysonContructions,
  }) =>
    <div>
      <h3 className="default btn-link">Dyson stats</h3>
      <div>
        Current productions: { listProductions(currentProductions) }
      </div>
      <div>
        Current ratios: { listRatios(currentProductionRatios, worstProduction) }
      </div>
      <div>
        Optimal ratios: { listRatios(dysonCostRatios) }
      </div>
      <h3 className="default btn-link">Dyson current cost</h3>
      {
        ([
          ['Ring', dysonContructions.ring],
          ['Swarm', dysonContructions.swarm],
          ['Sphere', dysonContructions.sphere]
        ] as [string, DysonContructionsState][]).map(([name, costs]) => (
          <div>
            { name } cost: { listCosts(costs.currentCost, costs.currentProduceTimeSec) }
          </div>
        ))
      }
      <h3 className="default btn-link">Dyson total cost</h3>
      {
        ([
          ['Ring', dysonContructions.ring],
          ['Swarm', dysonContructions.swarm],
          ['Sphere', dysonContructions.sphere]
        ] as [string, DysonContructionsState][]).map(([name, costs]) => (
          <div>
            { name } cost: { listCosts(costs.totalCost, costs.totalProduceTimeSec) }
          </div>
        ))
      }
    </div>
  );
}

function getWorstProduction(curr: DysonCostResources<number>, optimal: DysonCostResources<number>): ResourceType {
  return Object.keys(curr)
    .map(
      key => ({ key, val: getPercent((curr as any)[key], (optimal as any)[key]) })
    )
    .reduce((state, pair) => state && (pair.val < state.val ? pair : state) || pair).key as ResourceType;
}

function listCosts(costs: DysonCostResources<number>, produceTime?: DysonCostResources<number>) {
  const keys = Object.keys(costs);
  return keys.map((type, i) => (
    <span>
      <span>
        { i > 0 ? ' ' : '' }
        { format((costs as any)[type]) }
        { produceTime && (produceTime as any)[type] && ` (${toHHMMSS((produceTime as any)[type])})` || '' }
        { ' ' }
        { capitalizeFirstLetter(type) }
      </span>
      { i < (keys.length - 1) ? ',' : '' }
    </span>
  ));
}

function listProductions(productions: DysonCostResources<number>) {
  const keys = Object.keys(productions);
  return keys.map((type, i) => (
    <span>
      <span>
        { i > 0 ? ' ' : '' }
        { format((productions as any)[type]) }/Sec { capitalizeFirstLetter(type) }
      </span>
      { i < (keys.length - 1) ? ',' : '' }
    </span>
  ));
}

function listRatios(ratios: DysonCostResources<number>, worstProduction?: string) {
  const keys = Object.keys(ratios);
  return keys.map((type, i) => (
    <span>
      <span style={ { color: type === worstProduction ? 'red' : '' } }>
        { i > 0 ? ' ' : '' }
        { (ratios as any)[type] } { capitalizeFirstLetter(type) }
      </span>
      { i < (keys.length - 1) ? ',' : '' }
    </span>
  ));
}
