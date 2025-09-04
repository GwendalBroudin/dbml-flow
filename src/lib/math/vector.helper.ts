export type Vector2 = {
  x: number;
  y: number;
};

export function vectorAdd(v1: Vector2, v2: Vector2): Vector2 {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}
export function vectorSub(v1: Vector2, v2: Vector2): Vector2 {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
}
