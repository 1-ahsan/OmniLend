export function validateVendor(input) {
  const name =
    typeof input.name === "string" ? input.name.trim() : "";

  if (!name) {
    const error = new Error("Vendor name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (name.length > 60) {
    const error = new Error("Vendor name must be 150 characters or fewer.");
    error.statusCode = 400;
    throw error;
  }

  const phone =
    typeof input.phone === "string" ? input.phone.trim() : "";

  const email =
    typeof input.email === "string" ? input.email.trim() : "";

  const address =
    typeof input.address === "string" ? input.address.trim() : "";

  if (phone.length > 20) {
    const error = new Error("Phone must be 30 characters or fewer.");
    error.statusCode = 400;
    throw error;
  }

  if (email.length > 50) {
    const error = new Error("Email must be 255 characters or fewer.");
    error.statusCode = 400;
    throw error;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  return {
    name,
    phone: phone || null,
    email: email || null,
    address: address || null,
  };
}