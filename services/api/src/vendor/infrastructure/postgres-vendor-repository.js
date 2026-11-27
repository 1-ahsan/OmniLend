export function createPostgresVendorRepository(pool) {
  return {
    async create(vendor) {
      const query = `
        INSERT INTO vendors (name, phone, email, address)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, phone, email, address, created_at
      `;

      const values = [
        vendor.name,
        vendor.phone,
        vendor.email,
        vendor.address,
      ];

      const result = await pool.query(query, values);

      return result.rows[0];
    },

    async search(searchTerm = "") {
      const query = `
        SELECT id, name, phone, email, address, created_at
        FROM vendors
        WHERE
          name ILIKE $1
          OR COALESCE(phone, '') ILIKE $1
        ORDER BY name ASC, id ASC
        LIMIT 20
      `;

      const values = [`%${searchTerm.trim()}%`];

      const result = await pool.query(query, values);

      return result.rows;
    },
  };
}