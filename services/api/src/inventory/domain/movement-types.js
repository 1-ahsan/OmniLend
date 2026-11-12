export const MOVEMENT_TYPES = Object.freeze({
  OPENING: "opening",
  RECEIVED: "received",
  SOLD: "sold",
  TRANSFERRED_OUT: "transferred_out",
  DAMAGED: "damaged",
  LOST: "lost",
  COUNT_CORRECTION: "count_correction",
});

const INCREASES = new Set([MOVEMENT_TYPES.OPENING, MOVEMENT_TYPES.RECEIVED]);
const DECREASES = new Set([
  MOVEMENT_TYPES.SOLD,
  MOVEMENT_TYPES.TRANSFERRED_OUT,
  MOVEMENT_TYPES.DAMAGED,
  MOVEMENT_TYPES.LOST,
]);

export const isValidMovementType = (type) =>
  Object.values(MOVEMENT_TYPES).includes(type);

/**
 * Returns the signed change in stock.
 * For COUNT_CORRECTION, `quantity` is the counted quantity on the shelf.
 * For every other type, `quantity` is the amount moved (must be > 0).
 */
export function calculateQuantityChange(type, quantity, currentQuantity) {
  if (type === MOVEMENT_TYPES.COUNT_CORRECTION) {
    return quantity - currentQuantity;
  }
  if (INCREASES.has(type)) return quantity;
  if (DECREASES.has(type)) return -quantity;
  return 0;
}