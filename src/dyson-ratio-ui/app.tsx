import xs, { Stream } from 'xstream';
import { VNode, DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';

import { DysonCostResources, ResourceType } from '../game/game.interface';
import { AllResourceStreams } from '../game/game-resources';
import { getValueRatios, capitalizeFirstLetter, getPercent } from '../lib/utils';

export interface Sources {
  DOM: DOMSource;
  allResourceStreams: AllResourceStreams;
  dysonCostRatios$: xs<DysonCostResources<number>>;
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
  currentProductionRatios: DysonCostResources<number>,
  dysonCostRatios: DysonCostResources<number>,
  worstProduction?: ResourceType,
}
export interface Actions {
  currentProductionRatiosChange$: xs<DysonCostResources<number>>,
  dysonCostRatiosChange$: xs<DysonCostResources<number>>,
}

export function App(sources: Sources): Sinks {
  const action$ = intent(sources.allResourceStreams, sources.dysonCostRatios$);
  const reducer$ = model(action$);
  const vdom$ = view(sources.onion.state$);

  return {
    DOM: vdom$,
    onion: reducer$,
  };
}

function intent(allResourceStreams: AllResourceStreams, dysonCostRatios$: xs<DysonCostResources<number>>): Actions {
  const currentProductionRatiosChange$ = xs.combine(
      allResourceStreams.titanium.production$,
      allResourceStreams.gold.production$,
      allResourceStreams.silicon.production$,
      allResourceStreams.meteorite.production$,
      allResourceStreams.ice.production$,
    )
    .map(vals => getValueRatios(vals))
    .map(([titanium, gold, silicon, meteorite, ice]) => ({ titanium, gold, silicon, meteorite, ice }));

  const dysonCostRatiosChange$ = dysonCostRatios$;

  return {
    currentProductionRatiosChange$,
    dysonCostRatiosChange$,
  };
}

function model(actions: Actions): Stream<Reducer> {
  const initReducer$ = xs.of<Reducer>((prev: State) => {
    const state: State = {
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

  const currentDysonProductionReducer$ = actions.currentProductionRatiosChange$
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

  const worstProductionReducer$ = xs.combine(actions.currentProductionRatiosChange$, actions.dysonCostRatiosChange$)
    .map<Reducer>(([curr, cost]) => prev => {
      return {
        ...prev,
        worstProduction: getWorstProduction(curr, cost),
      };
    });

  return xs.merge(initReducer$, currentDysonProductionReducer$, dysonCostRatiosReducer$, worstProductionReducer$);
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map(({ currentProductionRatios, dysonCostRatios, worstProduction }) =>
    <div>
      <h3 className="default btn-link">Dyson ratio</h3>
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

function listRatios(ratios: DysonCostResources<number>, worstProduction?: string) {
  const ratioKeys = Object.keys(ratios);
  return ratioKeys.map((type, i) => (
    <span>
      <span style={ { color: type === worstProduction ? 'red': '' } }>
        { i > 0 ? ' ' : '' }
        { (ratios as any)[type] } { capitalizeFirstLetter(type) }
      </span>
      { i < (ratioKeys.length - 1) ? ',' : '' }
    </span>
  ));
}
