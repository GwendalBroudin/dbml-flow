export let pressedKeys = new Set<string>();

window.addEventListener("keydown", (event) => pressedKeys.add(event.key));
window.addEventListener("keyup", (event) => pressedKeys.delete(event.key));
