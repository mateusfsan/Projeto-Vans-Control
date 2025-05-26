import express from 'express';
import auth from '../middleware/auth.js';

// Importar rotas
import paisRoutes from './paisRoutes.js';
import jovensRoutes from './jovensRoutes.js';
import motoristasRoutes from './motoristasRoutes.js';
import rotasRoutes from './rotasRoutes.js';

const router = express.Router();

// Log para debug das rotas
router.use((req, res, next) => {
    console.log('=== Nova requisição ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    next();
});

// Registrar rotas na ordem correta
console.log('Registrando rotas de motoristas...');
router.use('/motoristas', auth, motoristasRoutes);

console.log('Registrando rotas de rotas...');
router.use('/rotas', auth, rotasRoutes);

console.log('Registrando rotas de pais...');
router.use('/pais', auth, paisRoutes);

console.log('Registrando rotas de jovens...');
router.use('/jovens', auth, jovensRoutes);

export default router; 