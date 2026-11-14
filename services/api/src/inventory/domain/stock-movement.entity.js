import { DomainError } from "./inventory-item.entity.js";
import { isValidMovementType } from "./movement-types.js";

export class StockMovement {
  constructor({
    id = null,
    tenantId,
    branchId,
    itemId = null, // null only for the opening movement, filled in by the repository
    type,
    quantityChange,
    quantityBefore,
    quantityAfter,
    note = null,
    createdBy = null,
    createdAt = null,
  }) {
    if (!tenantId || !branchId) {
      throw new DomainError("Tenant and branch are required.");
    }
    if (!isValidMovementType(type)) {
      throw new DomainError("Invalid stock movement type.");
    }

    this.id = id;
    this.tenantId = tenantId;
    this.branchId = branchId;
    this.itemId = itemId;
    this.type = type;
    this.quantityChange = quantityChange;
    this.quantityBefore = quantityBefore;
    this.quantityAfter = quantityAfter;
    this.note = note ? String(note).trim() : null;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }
}