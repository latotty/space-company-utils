export function toHHMMSS(sec_num: number) {
  const hours   = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  const seconds = sec_num - (hours * 3600) - (minutes * 60);

  return `${_(hours)}:${_(minutes)}:${_(seconds)}`;

  function _(num: number) {
    return ('00' + num).slice(-2);
  }
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getPercent(value: number, total: number, zeros: number = 0) {
  const num = Math.pow(10, zeros);
  return Math.round(value / total * 100 * num) / num;
}

export function getValueRatios<T extends number[]>(args: T): T {
  const sum = args.reduce((state, num) => state + num, 0);

  const ratios = args.map(p => getPercent(p, sum, 2));

  return ratios as T;
}
