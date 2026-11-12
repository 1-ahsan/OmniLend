export class AuthorizationService {

    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }

    async hasPermission(userId, requiredPermission) {

        const permissions =
            await this.roleRepository
                .findPermissionsByUserId(userId);

        return permissions.includes(requiredPermission);
    }

    async authorize(userId, requiredPermission) {

        const allowed = await this.hasPermission(
            userId,
            requiredPermission
        );

        if (!allowed) {
            throw new Error("Permission denied");
        }

        return true;
    }
}