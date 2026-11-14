import { DomainError } from "../domain/inventory-item.entity.js";
import { MOVEMENT_TYPES, isValidMovementType } from "../domain/movement-types.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bad = (message) => new DomainError(message, 400);

const requireObject = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw bad("Request body must be a JSON object.");
  }
  return body;
};

const requireText = (value, label, maxLength) => {
  if (typeof value !== "string" || !value.trim()) {
    throw bad(`${label} is required.`);
  }
  if (value.trim().length > maxLength) {
    throw bad(`${label} must be at most ${maxLength} characters.`);
  }
  return value.trim();
};

const toInteger = (value, label) => {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(n)) throw bad(`${label} must be a whole number.`);
  return n;
};

const toVendorId = (value) => {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || !UUID_REGEX.test(value)) {
    throw bad("Vendor id is not valid.");
  }
  return value;
};

export function validateId(id) {
  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw bad("Item id is not valid.");
  }
  return id;
}

export function validateCreateItemBody(body) {
  const data = requireObject(body);

  return {
    name: requireText(data.name, "Name", 180),
    category: requireText(data.category, "Category", 100),
    sku: requireText(data.sku, "SKU", 60),
    openingQuantity: toInteger(data.openingQuantity ?? 0, "Opening quantity"),
    reorderLevel: toInteger(data.reorderLevel ?? 0, "Reorder level"),
    vendorId: toVendorId(data.vendorId ?? null),
  };
}

// Only the fields that were sent are returned; missing fields stay unchanged.
export function validateUpdateItemBody(body) {
  const data = requireObject(body);
  const result = {};

  if (data.name !== undefined) result.name = requireText(data.name, "Name", 180);
  if (data.category !== undefined) result.category = requireText(data.category, "Category", 100);
  if (data.sku !== undefined) result.sku = requireText(data.sku, "SKU", 60);
  if (data.reorderLevel !== undefined) {
    result.reorderLevel = toInteger(data.reorderLevel, "Reorder level");
  }
  if (data.vendorId !== undefined) result.vendorId = toVendorId(data.vendorId);

  if (Object.keys(result).length === 0) {
    throw bad("Send at least one field to update.");
  }
  return result;
}

export function validateAdjustStockBody(body) {
  const data = requireObject(body);

  if (!isValidMovementType(data.type) || data.type === MOVEMENT_TYPES.OPENING) {
    throw bad(
      "Type must be one of: received, sold, transferred_out, damaged, lost, count_correction."
    );
  }

  const note =
    data.note === undefined || data.note === null ? null : String(data.note).trim();
  if (note && note.length > 500) throw bad("Note must be at most 500 characters.");

  return {
    type: data.type,
    quantity: toInteger(data.quantity, "Quantity"),
    note: note || null,
  };
}

export function validateListQuery(query = {}) {
  return {
    search: typeof query.search === "string" ? query.search : undefined,
    category: typeof query.category === "string" ? query.category : undefined,
    page: query.page,
    limit: query.limit,
  };
}

export function validatePageQuery(query = {}) {
  return { page: query.page, limit: query.limit };
}