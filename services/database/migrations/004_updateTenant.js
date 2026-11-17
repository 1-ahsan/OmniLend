// added 2 columns in tenant, deleted at, reason of suspension

// ALTER TABLE tenants
// ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
// ADD COLUMN IF NOT EXISTS suspension_reason TEXT NULL;