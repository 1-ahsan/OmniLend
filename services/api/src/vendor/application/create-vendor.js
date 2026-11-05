import { validateVendor } from "../domain/vendor.js";

export function createVendor(repository) {
  return async function execute(input) {
    const vendorData = validateVendor(input);

    return repository.create(vendorData);
  };
}