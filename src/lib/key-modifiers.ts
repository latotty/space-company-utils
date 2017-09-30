import { addCleanup } from './cleanup';
export function initKeyListener() { // legacy
  const keysObj = {
    ctrl: false,
    alt: false,
    shift: false,
  };

  document.addEventListener('keydown', keyEvent);
  document.addEventListener('keyup', keyEvent);
  addCleanup(() => {
    document.removeEventListener('keydown', keyEvent);
    document.removeEventListener('keyup', keyEvent);
  });

  return keysObj;

  function keyEvent(ev: KeyboardEvent) {
    keysObj.ctrl = ev.ctrlKey;
    keysObj.alt = ev.altKey;
    keysObj.shift = ev.shiftKey;
  }
}
