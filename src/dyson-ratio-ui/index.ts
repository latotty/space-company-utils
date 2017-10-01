import { run } from '@cycle/run';
import onionify from 'cycle-onionify';
import { makeDOMDriver } from '@cycle/dom';

import { getDysonUiSphereBlock } from '../game/dom';
import { allResourceStreams, AllResourceStreams } from '../game/game-resources';
import { dysonCostRatios$ } from '../game/game-cost';

import { insertAfterHTMLElement } from '../lib/insert-after-html-element';
import { addCleanup } from '../lib/cleanup';

import { App } from './app';

export function init() {
  const uiBlock = document.createElement('div');
  const { cleanup: cleanupCycleApp } = initCycleApp(uiBlock, allResourceStreams);

  const dysonUiSphereBlock = getDysonUiSphereBlock();
  insertAfterHTMLElement(uiBlock, dysonUiSphereBlock);

  addCleanup(() => {
    cleanupCycleApp();
    uiBlock.remove();
  });
}

function initCycleApp(target: HTMLElement, allResourceStreams: AllResourceStreams) {
  const main = onionify(App);

  const drivers = {
    DOM: makeDOMDriver(target),
    allResourceStreams: () => allResourceStreams,
    dysonCostRatios$: () => dysonCostRatios$,
  };
  const dispose = run(main as any, drivers);

  return {
    cleanup: () => dispose,
  };
}
