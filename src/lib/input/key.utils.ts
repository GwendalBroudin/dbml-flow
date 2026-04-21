export let pressedKeys = new Set<string>();

window.addEventListener("keydown", (event) => {
  console.log("Key down:", event.key);
  pressedKeys.add(event.key);
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key);
});
