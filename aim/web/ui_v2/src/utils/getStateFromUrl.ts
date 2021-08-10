import { decode } from './encoder/encoder';

export default function getStateFromUrl(paramName: string) {
  const searchParam = new URLSearchParams(window.location.search);
  const url: string = searchParam.get(paramName) || '';
  if (url) {
    return JSON.parse(decode(url));
  }
  return null;
}
