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
