export function createVendorController({
  createVendor,
  searchVendors,
}) {
  return {
    async create(req, res, next) {
      try {
        const vendor = await createVendor(req.body);

        return res.status(201).json({
          message: "Vendor created successfully.",
          data: vendor,
        });
      } catch (error) {
        next(error);
      }
    },

    async search(req, res, next) {
      try {
        const query =
          typeof req.query.q === "string" ? req.query.q : "";

        if (query.length > 100) {
          return res.status(400).json({
            message: "Search query must be 100 characters or fewer.",
          });
        }

        const vendors = await searchVendors(query);

        return res.status(200).json({
          data: vendors,
        });
      } catch (error) {
        next(error);
      }
    },
  };
}