export function insertAfterHTMLElement(newElement: HTMLElement, targetElement: HTMLElement) {
  const parent = targetElement.parentNode;
  if (!parent) { throw new Error('no parent'); }

  if (parent.lastChild === targetElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}
