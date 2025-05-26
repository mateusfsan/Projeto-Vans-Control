import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { Pai } from '../models/Pai.js';

const router = express.Router();

// Função de login
export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log('Tentativa de login para email:', email);

        // Verifica se o usuário existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            console.log('Senha inválida');
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Atualiza último acesso
        usuario.ultimoAcesso = new Date();
        await usuario.save();

        // Remove a senha do objeto de resposta
        const usuarioResponse = usuario.toObject();
        delete usuarioResponse.senha;

        // Adiciona dados específicos para pais
        if (usuario.tipo === 'pai') {
            const pai = await Pai.findOne({ usuario: usuario._id });
            if (pai) {
                usuarioResponse.registroFamiliar = pai.registroFamiliar;
                console.log('Registro Familiar encontrado:', pai.registroFamiliar);
            } else {
                console.log('Pai não encontrado para o usuário');
            }
        }

        // Gera o token JWT
        const token = jwt.sign(
            { 
                userId: usuario._id,
                tipo: usuario.tipo,
                registroFamiliar: usuarioResponse.registroFamiliar
            },
            process.env.JWT_SECRET || 'vanscontrol_secret_key_2024',
            { expiresIn: '24h' }
        );

        console.log('Login bem sucedido para:', email);
        res.json({
            message: 'Login realizado com sucesso',
            token,
            usuario: usuarioResponse,
            tipo: usuario.tipo
        });
    } catch (error) {
        console.error('Erro detalhado no login:', error);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
};

// Função para criar o primeiro administrador
export const setupAdmin = async (req, res) => {
    try {
        // Verifica se já existe algum administrador
        const adminExistente = await Usuario.findOne({ tipo: 'admin' });
        if (adminExistente) {
            return res.status(400).json({ message: 'Já existe um administrador cadastrado' });
        }

        const { email, senha } = req.body;

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        // Cria o usuário administrador
        const novoAdmin = new Usuario({
            tipo: 'admin',
            email,
            senha: hashSenha
        });

        await novoAdmin.save();

        res.status(201).json({
            message: 'Administrador criado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao criar administrador:', error);
        res.status(500).json({ message: 'Erro ao criar administrador' });
    }
};

export default router; 