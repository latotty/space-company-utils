import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';

import { format } from '../game/api';
import { DysonCostResources, ResourceType } from '../game/game.interface';
import { AllResourceStreams } from '../game/resources';
import { DysonCosts } from '../game/cost';
import { getValueRatios, capitalizeFirstLetter, getPercent } from '../lib/utils';

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
}

export interface Actions {
  currentProductionsChange$: xs<DysonCostResources<number>>;
  dysonCostRatiosChange$: xs<DysonCostResources<number>>;
}

export function App(sources: Sources): Sinks {
  const action$ = intent(sources.allResourceStreams, sources.dysonCosts.dysonSegmentCostRatios$);
  const reducer$ = model(action$);
  const vdom$ = view(sources.onion.state$);

  return {
    DOM: vdom$,
    onion: reducer$,
  };
}

function intent(allResourceStreams: AllResourceStreams, dysonCostRatios$: xs<DysonCostResources<number>>): Actions {
  const currentProductionsChange$ = xs.combine(
      allResourceStreams.titanium.production$,
      allResourceStreams.gold.production$,
      allResourceStreams.silicon.production$,
      allResourceStreams.meteorite.production$,
      allResourceStreams.ice.production$,
    )
    .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }));

  const dysonCostRatiosChange$ = dysonCostRatios$;

  return {
    currentProductionsChange$,
    dysonCostRatiosChange$,
  };
}

function model(actions: Actions): Stream<Reducer> {
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
    const state: State = {
      currentProductions: {
        titanium: 0,
        gold: 0,
        silicon: 0,
        meteorite: 0,
        ice: 0,
      },
      currentProductionRatios: {
        titanium: 0,
        gold: 0,
        silicon: 0,
        meteorite: 0,
        ice: 0,
      },
      dysonCostRatios: {
        titanium: 0,
        gold: 0,
        silicon: 0,
        meteorite: 0,
        ice: 0,
      },
    };
    return prev || state;
  });

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

  const dysonCostRatiosReducer$ = actions.dysonCostRatiosChange$
    .map<Reducer>(dysonCostRatios => prev => {
      return {
        ...prev,
        dysonCostRatios: { ...dysonCostRatios },
      };
    });

  const worstProductionReducer$ = xs.combine(currentProductionRatiosChange$, actions.dysonCostRatiosChange$)
    .map<Reducer>(([curr, cost]) => prev => {
      return {
        ...prev,
        worstProduction: getWorstProduction(curr, cost),
      };
    });

  return xs.merge(
    initReducer$,
    currentProductionsReducer$,
    currentDysonProductionReducer$,
    dysonCostRatiosReducer$,
    worstProductionReducer$
  );
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map(({ currentProductions, currentProductionRatios, dysonCostRatios, worstProduction }) =>
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

function listProductions(producions: DysonCostResources<number>) {
  const keys = Object.keys(producions);
  return keys.map((type, i) => (
    <span>
      <span>
        { i > 0 ? ' ' : '' }
        { format((producions as any)[type]) }/Sec { capitalizeFirstLetter(type) }
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
