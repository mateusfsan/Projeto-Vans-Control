import express from 'express';
import bcrypt from 'bcryptjs';
import { Pai } from '../models/Pai.js';
import { Usuario } from '../models/Usuario.js';

const router = express.Router();

// Função para gerar RF único
const gerarRF = async () => {
    const ano = new Date().getFullYear();
    const ultimoPai = await Pai.findOne().sort({ registroFamiliar: -1 });
    let numero = 1;
    
    if (ultimoPai && ultimoPai.registroFamiliar) {
        const ultimoNumero = parseInt(ultimoPai.registroFamiliar.split('-')[1]);
        numero = ultimoNumero + 1;
    }
    
    return `${ano}-${numero.toString().padStart(4, '0')}`;
};

// Rota para cadastro de pais
router.post('/', async (req, res) => {
    try {
        const {
            registroFamiliar,
            nomePai, dataNascPai, cpfPai,
            nomeMae, dataNascMae, cpfMae,
            endereco, cep, telefone, email, senha
        } = req.body;

        // Verifica se já existe usuário com este email
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Verifica se já existe pai com este CPF
        const paiExistenteCpfPai = await Pai.findOne({ cpfPai });
        if (paiExistenteCpfPai) {
            return res.status(400).json({ message: 'CPF do pai já cadastrado' });
        }

        // Verifica se já existe mãe com este CPF
        const paiExistenteCpfMae = await Pai.findOne({ cpfMae });
        if (paiExistenteCpfMae) {
            return res.status(400).json({ message: 'CPF da mãe já cadastrado' });
        }

        // Cria o usuário
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            tipo: 'pai',
            email,
            senha: hashSenha
        });

        await novoUsuario.save();

        // Cria o registro do pai
        const novoPai = new Pai({
            usuario: novoUsuario._id,
            registroFamiliar,
            nomePai,
            dataNascPai: new Date(dataNascPai),
            cpfPai,
            nomeMae,
            dataNascMae: new Date(dataNascMae),
            cpfMae,
            endereco,
            cep,
            telefone,
            email
        });

        await novoPai.save();

        res.status(201).json({
            message: 'Cadastro realizado com sucesso',
            registroFamiliar
        });
    } catch (error) {
        console.error('Erro no cadastro de pais:', error);
        
        // Se houver erro, tenta remover o usuário criado para manter consistência
        if (novoUsuario && novoUsuario._id) {
            await Usuario.findByIdAndDelete(novoUsuario._id);
        }
        
        res.status(500).json({ message: 'Erro ao realizar cadastro: ' + error.message });
    }
});

// Rota para buscar dados dos pais por RF
router.get('/rf/:registroFamiliar', async (req, res) => {
    try {
        const { registroFamiliar } = req.params;
        const pai = await Pai.findOne({ registroFamiliar });

        if (!pai) {
            return res.status(404).json({ message: 'Registro Familiar não encontrado' });
        }

        res.json(pai);
    } catch (error) {
        console.error('Erro ao buscar dados dos pais:', error);
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
});

// Rota para buscar pai por CPF
router.get('/cpf/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        console.log('Buscando CPF:', cpf);
        
        // Remove qualquer formatação do CPF
        const cpfLimpo = cpf.replace(/\D/g, '');
        console.log('CPF limpo:', cpfLimpo);
        
        // Procura pelo CPF sem formatação
        let pai = await Pai.findOne({
            $or: [
                { cpfPai: cpfLimpo },
                { cpfMae: cpfLimpo }
            ]
        });
        
        console.log('Pai encontrado:', pai);

        if (!pai) {
            return res.status(404).json({ message: 'Nenhum registro encontrado para este CPF' });
        }

        res.json({
            registroFamiliar: pai.registroFamiliar,
            nomePai: pai.nomePai,
            nomeMae: pai.nomeMae
        });
    } catch (error) {
        console.error('Erro ao buscar pai por CPF:', error);
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
});

export default router; 