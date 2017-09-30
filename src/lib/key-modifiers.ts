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
