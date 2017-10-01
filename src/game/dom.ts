import { ResourceType } from './game.interface';

export function getResourceTabRowByType(type: ResourceType) {
  const rowId = `${type}Nav`;
  const $resourceNavParent = document.getElementById('resourceNavParent')!;
  const $row = $resourceNavParent.querySelector(`#${rowId}`);
  if (!$row) {
    throw new Error(`getResourceTabRowByType cannot find ${type}`);
  }
  return $row as HTMLTableRowElement;
}

export function getResourceSidebarRowImages(): HTMLImageElement[] {
  return Array.from(
    document.querySelectorAll('#resourceNavParent tr td:first-child img')
  ) as HTMLImageElement[];
}
