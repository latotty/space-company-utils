import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';

import { ResourceType, resources, getResourceTabRowByType, resourceTabSideBarResources } from '../game';
import { addCleanup } from '../lib/cleanup';

export function init() {
  resourceTabSideBarResources.forEach((type: ResourceType) => {
    initResourceProgressBar(type);
  });
}

function initResourceProgressBar(type: ResourceType) {
  const percent$ = xs.combine(resources[type].storage$, resources[type].amount$)
    .map(([storage, amount]) => {
      if (storage <= 0 || amount <= 0) {
        return 0;
      }
      if (amount > storage) {
        return 100;
      }
      return Math.round(amount / storage * 100);
    })
    .compose(dropRepeats());

  const { $progressDiv, $progressBarDiv } = createProgressBarElements();

  const sub = percent$.subscribe({
    next(value) {
      $progressBarDiv.setAttribute('aria-valuenow', '' + value);
      $progressBarDiv.style.width = `${value}%`;
    },
    error: (error) => console.error('getProgressBar', error),
    complete: () => {},
  });

  addCleanup(() => {
    $progressDiv.remove();
    $progressBarDiv.remove();
    sub.unsubscribe();
  });

  const $resourceRow = getResourceTabRowByType(type);
  const $firstCol = $resourceRow.querySelector('td:first-child') as HTMLTableColElement;
  $firstCol.appendChild($progressDiv);
}

function createProgressBarElements() {
  const $progressDiv = document.createElement('div');
  $progressDiv.className = 'progress';
  $progressDiv.style.position = 'absolute';
  $progressDiv.style.width = '100%';
  $progressDiv.style.left = '0';
  $progressDiv.style.top = 'auto';
  $progressDiv.style.height = '2px';
  $progressDiv.style.marginTop = '14px';
  const $progressBarDiv = document.createElement('div');
  $progressBarDiv.className = 'progress-bar';
  $progressBarDiv.setAttribute('role', 'progressbar');
  $progressBarDiv.setAttribute('aria-valuenow', '0');
  $progressBarDiv.setAttribute('aria-valuemin', '0');
  $progressBarDiv.setAttribute('aria-valuemax', '100');
  $progressBarDiv.style.width = '0';

  $progressDiv.appendChild($progressBarDiv);

  return { $progressDiv, $progressBarDiv };
}