import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";

const codeParam = "code";

export function getCodeFromUrl() {
  return getUrlB64Param(codeParam);
}

export function setCodeInUrl(code: string) {
  setUrlB64Param(codeParam, code);
}

export function getUrlB64Param(key: string) {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(key);
  if (!value) return "";

  const array = Uint8Array.from(window.atob(value), (c) => c.charCodeAt(0));
  const unzip = decompressSync(array);
  const ascii = strFromU8(unzip);

  return decodeURIComponent(ascii);
}

export function setUrlB64Param(key: string, value: string) {
  let success = true;
  let uriComponent = "";
  if (value) {
    const buf = strToU8(value);
    const compressed = compressSync(buf, { level: 9 });
    uriComponent = window.btoa(String.fromCharCode(...compressed));
  }

  const url = new URL(window.location.href);
  url.searchParams.set(key, uriComponent);
  let urlString = urlToCleanString(url);

  // remove the param if it's too long
  if (urlString.length > 32767) {
    console.error("URL param too long", key, uriComponent.length);
    success = false;
    url.searchParams.delete(key);
    urlString = urlToCleanString(url);
  }

  window.history.pushState(null, "", urlToCleanString(url));

  return success;
}

export function urlToCleanString(url: URL) {
  return url.origin + url.pathname + url.hash + url.search;
}
