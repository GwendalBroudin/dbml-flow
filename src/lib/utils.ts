import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextWidth(
  char = "x",
  font = "14px 'Inconsolata', monospace"
) {
  const span = document.createElement("span");
  span.style.font = font;
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.textContent = char;
  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);
  return width;
}

export function toMap<T>(arr: T[], getId: (item: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of arr) {
    const id = getId(item);
    if (!id) {
      throw new Error("Item has no id");
    }
    map.set(id, item);
  }
  return map;
}

export function toMapId<K, T extends { id: K }>(arr: T[]): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of arr) {
    if (!item.id) {
      throw new Error("Item has no id");
    }
    map.set(item.id, item);
  }
  return map;
}
