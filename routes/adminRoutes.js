import express from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario.js';

const router = express.Router();

// Rota para cadastro de administrador
router.post('/register', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verifica se já existe usuário com este email
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        // Cria o usuário administrador
        const novoUsuario = new Usuario({
            tipo: 'admin',
            email,
            senha: hashSenha
        });

        await novoUsuario.save();

        res.status(201).json({
            message: 'Administrador cadastrado com sucesso'
        });
    } catch (error) {
        console.error('Erro no cadastro de administrador:', error);
        res.status(500).json({ message: 'Erro ao realizar cadastro' });
    }
});

export default router; 