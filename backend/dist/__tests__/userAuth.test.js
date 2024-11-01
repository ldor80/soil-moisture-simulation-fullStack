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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const userService_1 = require("../services/userService");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock('../services/userService');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/users', userRoutes_1.default);
describe('User Authentication', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/users/register', () => {
        it('should register a new user with valid input', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                created_at: new Date(),
                updated_at: new Date()
            };
            userService_1.createUser.mockResolvedValue(mockUser);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users/register')
                .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User created successfully');
            expect(response.body).toHaveProperty('userId', 1);
        }));
        it('should return 400 for invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users/register')
                .send({
                username: 'te',
                email: 'invalid-email',
                password: 'short'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toHaveLength(3);
        }));
    });
    describe('POST /api/users/login', () => {
        it('should login a user with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                created_at: new Date(),
                updated_at: new Date()
            };
            userService_1.getUserByEmail.mockResolvedValue(mockUser);
            bcrypt_1.default.compare.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('mockedtoken');
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token', 'mockedtoken');
        }));
        it('should not login a user with incorrect credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            userService_1.getUserByEmail.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
        }));
        it('should return 400 for invalid input', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/users/login')
                .send({
                email: 'invalid-email',
                password: ''
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toHaveLength(2);
        }));
    });
});
