import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';

import { getResource, getProduction, getResourceEmc, getStorage, resourceTypes } from './api';
import { ResourceType, AllResources } from './game.interface';

interface ResourceStreams {
  amount$: xs<number>;
  production$: xs<number>;
  emc$: xs<number>;
  storage$: xs<number>;
}

const timer$ = xs.periodic(25);

export type AllResourceStreams = AllResources<ResourceStreams>;
export const allResourceStreams: AllResourceStreams = resourceTypes.reduce<AllResourceStreams>((state, type) => {
  return {
    ...state,
    [type]: getResourceStream(type, timer$),
  };
}, {} as any);

function getResourceStream(type: ResourceType, trigger$ = xs.periodic(25)) {
  const amount$ = trigger$
    .map(() => getResource(type))
    .compose(dropRepeats())
    .remember();

  const production$ = trigger$
    .map(() => getProduction(type))
    .compose(dropRepeats())
    .remember();

  const emc$ = trigger$
    .map(() => getResourceEmc(type))
    .compose(dropRepeats())
    .remember();

  const storage$ = trigger$
    .map(() => getStorage(type))
    .compose(dropRepeats())
    .remember();

  return {
    amount$,
    production$,
    emc$,
    storage$
  };
}
