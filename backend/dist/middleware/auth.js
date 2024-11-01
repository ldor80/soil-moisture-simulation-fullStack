"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
/**
 * Development mode authentication middleware
 * Always authenticates as the default user (id: 1)
 * This is a simplified version for development purposes only
 */
function authenticateToken(req, res, next) {
    // In development mode, always authenticate as default user
    req.user = {
        id: 1,
        username: 'dev_user'
    };
    next();
}
