export function requirePermission(
    authorizationService,
    permission
) {
    return async (req, res, next) => {

        try {

            const userId = req.user.id;

            await authorizationService.authorize(
                userId,
                permission
            );

            next();

        } catch (error) {

            if (error.message === "Permission denied") {
                return res.status(403).json({
                    message: "You don't have permission"
                });
            }

            next(error);
        }
    };
}