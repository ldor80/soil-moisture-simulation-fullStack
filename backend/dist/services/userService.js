"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserByEmail = getUserByEmail;
/**
 * Development mode user service
 * In development, we use a default user (id: 1) for all operations
 */
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        // In development mode, return default user without database operation
        return {
            id: 1,
            username: 'dev_user',
            email: 'dev@example.com',
            password_hash: 'dev_mode_no_hash',
            created_at: new Date(),
            updated_at: new Date()
        };
    });
}
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        // In development mode, always return default user
        return {
            id: 1,
            username: 'dev_user',
            email: 'dev@example.com',
            password_hash: 'dev_mode_no_hash',
            created_at: new Date(),
            updated_at: new Date()
        };
    });
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        // In development mode, always return default user
        return {
            id: 1,
            username: 'dev_user',
            email: 'dev@example.com',
            password_hash: 'dev_mode_no_hash',
            created_at: new Date(),
            updated_at: new Date()
        };
    });
}
