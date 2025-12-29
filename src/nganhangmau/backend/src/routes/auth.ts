import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { LoginSchema, RegisterDonorSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validateBody(LoginSchema), login);
router.post('/register', validateBody(RegisterDonorSchema), register);

export default router;
