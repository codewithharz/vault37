import * as auditService from '../services/auditService.js';

/**
 * Middleware to automatically log state-changing operations
 * @param {String} module - The name of the module (e.g., 'Wallet', 'TPIA')
 */
const auditMiddleware = (module) => {
    return (req, res, next) => {
        // Only log state-changing methods
        const trackedMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
        if (!trackedMethods.includes(req.method)) {
            return next();
        }

        // Capture original send to log after response is sent
        const originalSend = res.send;

        res.send = function (body) {
            res.send = originalSend;
            const responseBody = typeof body === 'string' ? JSON.parse(body) : body;

            // Determine status
            const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';

            // Log the action asynchronously
            auditService.logAdminAction({
                userId: req.user?.id,
                adminId: req.user?.role === 'admin' ? req.user.id : null,
                action: `${req.method} ${req.originalUrl}`,
                module,
                targetType: module.toLowerCase(),
                targetId: req.params.id || responseBody?.data?.id || responseBody?.data?._id,
                newData: req.method !== 'DELETE' ? req.body : null,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                status,
                errorMessage: status === 'failure' ? responseBody?.message : null,
                metadata: {
                    statusCode: res.statusCode,
                    query: req.query,
                },
            }).catch(err => console.error('Audit Middleware Error:', err));

            return res.send(body);
        };

        next();
    };
};

export default auditMiddleware;
