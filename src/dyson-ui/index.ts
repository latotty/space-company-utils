import { run } from '@cycle/run';
import onionify from 'cycle-onionify';
import { makeDOMDriver } from '@cycle/dom';

import { getDysonTabSphereBlock } from '../game/dom';
import { allResourceStreams, AllResourceStreams } from '../game/resources';
import { dysonCostRatios$ } from '../game/cost';

import { insertAfterHTMLElement } from '../lib/insert-after-html-element';
import { addCleanup } from '../lib/cleanup';

import { App } from './app';

export function init() {
  const containerDiv = document.createElement('div');
  const { cleanup: cleanupCycleApp } = initCycleApp(containerDiv, allResourceStreams);

  const dysonUiSphereBlock = getDysonTabSphereBlock();
  insertAfterHTMLElement(containerDiv, dysonUiSphereBlock);

  addCleanup(() => {
    cleanupCycleApp();
    containerDiv.remove();
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
