import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All user management routes require authentication and SUPERADMIN role
router.use(authenticate);
router.use(requireRole(['SUPERADMIN'] as any));

// GET /api/v1/users — List all users with filters
router.get('/', UserController.listUsers);

// GET /api/v1/users/pending — Get pending accounts (must be before /:id)
router.get('/pending', UserController.getPendingUsers);

// GET /api/v1/users/:id — Get user by ID
router.get('/:id', UserController.getUserById);

// PATCH /api/v1/users/:id/status — Approve/Reject/Pending
router.patch('/:id/status', UserController.updateUserStatus);

// PATCH /api/v1/users/:id/role — Change user role
router.patch('/:id/role', UserController.updateUserRole);

// DELETE /api/v1/users/:id — Delete a user
router.delete('/:id', UserController.deleteUser);

export default router;
