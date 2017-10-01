import xs from 'xstream';

import {
  getResource, getStorage, getProduction, getResourceEmc,
  getDysonAmount, format, getCost, getResourceTypeFromId
} from '../game/api';
import { ResourceType } from '../game/game.interface';
import { getDysonCost } from '../game/cost';
import { toHHMMSS, capitalizeFirstLetter } from '../lib/utils';
import { addCleanup } from '../lib/cleanup';
import { altKey$, ctrlKey$, shiftKey$ } from '../lib/key-modifiers';
import { insertAfterHTMLElement } from '../lib/insert-after-html-element';

export function init() {
  const keys = initKeyListener();

  Array.from(document.querySelectorAll('span[id*="Cost"]'))
    .filter($el => !!getResourceTypeFromId($el.id))
    .forEach(initCostUi);

  initDysonUi(50);
  initDysonUi(100);
  initDysonUi(250);

  function initDysonUi(amount: number) {
    const $prevEl = document.querySelector('button[onclick="getDyson()"]')!
      .previousSibling!.previousSibling!.previousSibling!.previousSibling!.previousSibling! as HTMLElement;

    const span = createSpan();

    insertAfterHTMLElement(span, $prevEl);

    const tid = setInterval(() => {
      const cost = (Array.from(Array(Math.max(amount - getDysonAmount(), 0))) as number[]).reduce((state, _, index) => {
        const lvl = index + getDysonAmount();
        const subCost = getDysonCost(lvl);
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

      span.innerHTML = (amount <= getDysonAmount()) ? '' : `<br>The next ${ amount - getDysonAmount() } section costs:
        ${ renderCostPart(cost.titanium, 'titanium') },
        ${ renderCostPart(cost.gold, 'gold') },
        ${ renderCostPart(cost.silicon, 'silicon') },
        ${ renderCostPart(cost.meteorite, 'meteorite') },
        ${ renderCostPart(cost.ice, 'ice') }.`;
    }, 500);

    addCleanup(() => {
      span.remove();
      clearInterval(tid);
    });

    function renderCostPart(cost: number, type: ResourceType) {
      const resource = getResourceValue(type);
      const costTipText = getCostTipText(type, cost);

      return `<span ${ (cost > resource.value) ? 'class="red"' : '' }>${ format(cost) }</span>` +
        capitalizeFirstLetter(type) +
        costTipText;
    }
  }

  function getCostTipTextWithId(id: string) {
    return getCostTipText(getResourceTypeFromId(id), getCost(id));
  }

  function getCostTipText(type: ResourceType, cost: number) {
    if (keys.alt) {
      return altCostTipText();
    }

    return normalCostTipText();

    function normalCostTipText() {
      let text = '';
      const resource = getResourceValue(type);

      if (resource.value === undefined) {
        return '';
      }

      if (cost <= resource.value) {
        return '';
      }

      const remainingVal = Math.max((cost - resource.value), 0);
      const remainingSec = resource.ps > 0 && Math.floor(remainingVal / resource.ps) || 0;
      const remaining = toHHMMSS(remainingSec);

      const canEmc = type === 'meteorite' ?
        getResourceValue('plasma').value / resource.emcVal >= cost :
        getResourceValue('energy').value / resource.emcVal >= cost;

      if (resource.storage !== -1 && cost > resource.storage) {
        text = ` [OverStorage]`;
      } else if (resource.ps <= 0) {
        text = ` [NoGain]`;
      } else if (!remainingVal) {
        text = ` [${ format(resource.value) }]`;
      } else {
        text = ` (${remaining})`;
      }

      if (canEmc) {
        text += ` {EMC}`;
      }

      return text;
    }

    function altCostTipText() {
      const resource = getResourceValue(type);

      const totalPercentText = cost > resource.storage ?
        'OverStorage' :
        Math.round(cost / resource.storage * 100) + '%';

      const timeToGenerateText = resource.ps <= 0 ? 'NoGain' : toHHMMSS(Math.floor(cost / resource.ps));

      const emcType = type === 'meteorite' ? 'plasma' : 'energy';
      const emcResource = getResourceValue(emcType);
      const emcCost = resource.emcVal * cost;
      const emcPercent = emcCost > emcResource.storage ?
        'OverStorage' :
        Math.round(emcCost / emcResource.storage * 100) + '%';
      const emcTimeToGenerateText = emcResource.ps <= 0 ? 'NoGain' : toHHMMSS(Math.floor(emcCost / emcResource.ps));
      const emcCostText = `${ format(resource.emcVal * cost) } ${ capitalizeFirstLetter(emcType) }`;

      return ` <span>[${ totalPercentText }] (${ timeToGenerateText }) {${ emcCostText } [${ emcPercent }] (${emcTimeToGenerateText})}</span>`;
    }
  }

  function initCostUi($el: HTMLElement) {
    const id = $el.id;

    const span = createSpan();

    insertAfterHTMLElement(span, $el);

    const tid = setInterval(() => {
      span.innerHTML = getCostTipTextWithId(id);
    }, 500);

    addCleanup(() => {
      span.remove();
      clearInterval(tid);
    });
  }

  function createSpan() {
    return document.createElement('span');
  }

  function getResourceValue(type: ResourceType) {
    return {
      value: getResource(type),
      storage: getStorage(type),
      emcVal: getResourceEmc(type),
      ps: getProduction(type),
    };
  }
}

function initKeyListener() { // legacy
  const keysObj = {
    alt: false,
    ctrl: false,
    shift: false,
  };

  const sub = xs.combine(altKey$, ctrlKey$, shiftKey$)
    .map(([alt, ctrl, shift]) => ({ alt, ctrl, shift }))
    .subscribe({
      next: (mods) => Object.assign(keysObj, mods),
      error: err => console.error('initKeyListener', err),
      complete: () => console.debug('initKeyListener completed'),
    });

  addCleanup(() => {
    sub.unsubscribe();
  });

  return keysObj;
}
