
exports.up = (pgm) => {
  pgm.sql(`

        CREATE TABLE roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            name VARCHAR(50) NOT NULL UNIQUE,

            description VARCHAR(255),

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO roles (name, description)
        VALUES
        ('SUPER_ADMIN', 'Platform administrator'),
        ('OWNER', 'Tenant owner'),
        ('MANAGER', 'Branch manager'),
        ('DATA_OPERATOR', 'Branch data operator');


        CREATE TABLE permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            code VARCHAR(100) NOT NULL UNIQUE,

            description VARCHAR(255),

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO permissions (code, description)
        VALUES
        -- Branch
        ('branch:create', 'Create branches'),
        ('branch:view', 'View branches'),
        ('branch:update', 'Update branches'),
        ('branch:delete', 'Delete branches'),
        ('branch:assign-manager', 'Assign managers'),

        -- Manager
        ('manager:create', 'Create managers'),
        ('manager:view', 'View managers'),
        ('manager:update', 'Update managers'),
        ('manager:delete', 'Delete managers');


        CREATE TABLE role_permissions (
            role_id UUID NOT NULL,
            permission_id UUID NOT NULL,

            PRIMARY KEY (role_id, permission_id),

            FOREIGN KEY (role_id)
                REFERENCES roles(id)
                ON DELETE CASCADE,

            FOREIGN KEY (permission_id)
                REFERENCES permissions(id)
                ON DELETE CASCADE
        );

        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'OWNER'
        AND p.code IN (
            'branch:create',
            'branch:view',
            'branch:update',
            'branch:delete',
            'branch:assign-manager',
            'manager:create',
            'manager:view',
            'manager:update',
            'manager:delete'
        );


        ALTER TABLE users
        ADD COLUMN role_id UUID REFERENCES roles(id);


    `)
}

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS roles;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS role_permissions;

  `);
};