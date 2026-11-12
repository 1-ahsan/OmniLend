import {
  isValidMovementType,
  MOVEMENT_TYPES,
  calculateQuantityChange,
} from "./movement-types.js";

export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "DomainError";
    this.statusCode = statusCode;
  }
}

const isNonNegativeInt = (v) => Number.isInteger(v) && v >= 0;

/**
 * One item = a product stocked in one branch.
 * - `id`        → branch_inventory row
 * - `productId` → products row (shared across the tenant's branches)
 */
export class InventoryItem {
  constructor({
    id = null,
    productId = null,
    tenantId,
    branchId,
    name,
    category,
    sku,
    quantity,
    reorderLevel,
    vendorId = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.productId = productId;
    this.tenantId = tenantId;
    this.branchId = branchId;
    this.name = String(name ?? "").trim();
    this.category = String(category ?? "").trim();
    this.sku = String(sku ?? "").trim().toUpperCase();
    this.quantity = quantity;
    this.reorderLevel = reorderLevel;
    this.vendorId = vendorId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.#validate();
  }

  #validate() {
    if (!this.tenantId || !this.branchId) {
      throw new DomainError("Tenant and branch are required.");
    }
    if (!this.name) throw new DomainError("Item name is required.");
    if (!this.category) throw new DomainError("Category is required.");
    if (!this.sku) throw new DomainError("SKU is required.");
    if (!isNonNegativeInt(this.quantity)) {
      throw new DomainError("Quantity must be a whole number, 0 or more.");
    }
    if (!isNonNegativeInt(this.reorderLevel)) {
      throw new DomainError("Reorder level must be a whole number, 0 or more.");
    }
  }

  isBelowReorderLevel() {
    return this.quantity < this.reorderLevel;
  }

  // Quantity is intentionally NOT editable here; it only changes via applyMovement().
  updateDetails({ name, category, sku, reorderLevel, vendorId }) {
    const updated = new InventoryItem({
      ...this,
      name: name ?? this.name,
      category: category ?? this.category,
      sku: sku ?? this.sku,
      reorderLevel: reorderLevel ?? this.reorderLevel,
      vendorId: vendorId === undefined ? this.vendorId : vendorId,
    });
    Object.assign(this, updated);
  }

  applyMovement(type, quantity) {
    if (!isValidMovementType(type)) {
      throw new DomainError("Invalid stock movement type.");
    }

    const isCount = type === MOVEMENT_TYPES.COUNT_CORRECTION;
    const isValidQuantity = isCount
      ? isNonNegativeInt(quantity)
      : Number.isInteger(quantity) && quantity > 0;

    if (!isValidQuantity) {
      throw new DomainError(
        isCount
          ? "Counted quantity must be a whole number, 0 or more."
          : "Quantity must be a whole number greater than 0."
      );
    }

    const before = this.quantity;
    const change = calculateQuantityChange(type, quantity, before);
    const after = before + change;

    if (after < 0) {
      throw new DomainError("Not enough stock for this adjustment.", 409);
    }

    this.quantity = after;
    return { change, before, after };
  }
}