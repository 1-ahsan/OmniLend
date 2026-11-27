
export const up = (pgm) => {
    pgm.addColumns("tenants", {
        suspension_reason: {
            type: "TEXT",
            notNull: false
        },
        suspended_at: {
            type: "TIMESTAMPTZ",
            notNull: false
        }
    });

    pgm.addConstraint("tenants", "tenants_suspension_check", {
        check: `
            (
                status = 'active'
                AND suspension_reason IS NULL
                AND suspended_at IS NULL
            )
            OR
            (
                status = 'suspended'
                AND suspension_reason IS NOT NULL
                AND suspended_at IS NOT NULL
            )
            OR
            (
                status NOT IN ('ACTIVE', 'suspended')
                AND suspension_reason IS NULL
                AND suspended_at IS NULL
            )
        `
    });
};

export const down = (pgm) => {
    pgm.dropConstraint("tenants", "tenants_suspension_check");

    pgm.dropColumns("tenants", [
        "suspension_reason",
        "suspended_at"
    ]);
};
