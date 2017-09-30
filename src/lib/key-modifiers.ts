import xs from 'xstream';
import fromEvent from 'xstream/extra/fromEvent';
import dropRepeats from 'xstream/extra/dropRepeats';

const keydownEvent$: xs<KeyboardEvent> = fromEvent(document, 'keydown');
const keyupEvent$: xs<KeyboardEvent> = fromEvent(document, 'keyup');

const keyEvents$ = xs.merge(keydownEvent$, keyupEvent$);

const keyModifiers$ = keyEvents$.map(ev => ({
  alt: ev.altKey,
  ctrl: ev.ctrlKey,
  shift: ev.shiftKey,
}));

export const altKey$ = keyModifiers$.map(mods => mods.alt)
  .compose(dropRepeats())
  .remember();

export const ctrlKey$ = keyModifiers$.map(mods => mods.ctrl)
  .compose(dropRepeats())
  .remember();

export const shiftKey$ = keyModifiers$.map(mods => mods.shift)
  .compose(dropRepeats())
  .remember();

import { addCleanup } from './cleanup';
export function initKeyListener() { // legacy
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
