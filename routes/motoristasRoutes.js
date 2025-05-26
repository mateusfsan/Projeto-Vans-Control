import express from 'express';
import bcrypt from 'bcryptjs';
import { Motorista } from '../models/Motorista.js';
import { Usuario } from '../models/Usuario.js';
import { Rota } from '../models/Rota.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Rota para buscar rota do motorista
router.get('/rotas/:motoristaId', auth, async (req, res) => {
    try {
        console.log('=== Buscando rota do motorista ===');
        console.log('URL completa:', req.originalUrl);
        console.log('ID do motorista:', req.params.motoristaId);
        
        // Busca todas as rotas para debug
        const todasRotas = await Rota.find({});
        console.log('Todas as rotas no banco:', todasRotas);
        
        // Busca a rota do motorista usando o ID do motorista
        const rota = await Rota.findOne({ 
            motoristaId: req.params.motoristaId 
        }).populate('pontos.jovem', 'nome enderecoBusca');
        
        console.log('Rota encontrada:', rota);
        
        if (!rota) {
            console.log('Nenhuma rota encontrada para o motorista');
            return res.status(404).json({ message: 'Nenhuma rota encontrada para este motorista' });
        }

        // Formatar os pontos da rota
        const pontosFormatados = rota.pontos.map(ponto => ({
            nomeJovem: ponto.nomeJovem,
            enderecoBusca: ponto.enderecoBusca
        }));

        console.log('Pontos formatados:', pontosFormatados);

        res.json({
            nome: rota.nome,
            pontos: pontosFormatados
        });
    } catch (error) {
        console.error('Erro ao buscar rota:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Erro ao buscar rota do motorista' });
    }
});

// Rota para cadastro de motoristas
router.post('/', async (req, res) => {
    try {
        const {
            nome, dataNascimento, cpf, cnh,
            endereco, cep, telefone, email, senha,
            diasTrabalho
        } = req.body;

        // Verifica idade mínima (21 anos)
        const idade = new Date().getFullYear() - new Date(dataNascimento).getFullYear();
        if (idade < 21) {
            return res.status(400).json({ message: 'Motorista deve ter no mínimo 21 anos' });
        }

        // Verifica se os dias de trabalho são válidos
        const diasValidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        if (!diasTrabalho || !Array.isArray(diasTrabalho) || diasTrabalho.length === 0) {
            return res.status(400).json({ message: 'Selecione pelo menos um dia de trabalho' });
        }

        const diasInvalidos = diasTrabalho.filter(dia => !diasValidos.includes(dia));
        if (diasInvalidos.length > 0) {
            return res.status(400).json({ message: 'Dias de trabalho inválidos' });
        }

        // Verifica se já existe usuário com este email
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Verifica se já existe motorista com este CPF ou CNH
        const motoristaExistente = await Motorista.findOne({ $or: [{ cpf }, { cnh }] });
        if (motoristaExistente) {
            return res.status(400).json({ message: 'CPF ou CNH já cadastrados' });
        }

        // Cria o usuário
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        const novoUsuario = new Usuario({
            tipo: 'motorista',
            email,
            senha: hashSenha
        });

        await novoUsuario.save();

        // Cria o registro do motorista
        const novoMotorista = new Motorista({
            usuario: novoUsuario._id,
            nome,
            dataNascimento,
            cpf,
            cnh,
            endereco,
            cep,
            telefone,
            email,
            diasTrabalho
        });

        await novoMotorista.save();

        res.status(201).json({
            message: 'Cadastro realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro no cadastro de motorista:', error);
        res.status(500).json({ message: 'Erro ao realizar cadastro' });
    }
});

// Rota para listar todos os motoristas
router.get('/', async (req, res) => {
    try {
        console.log('Rota GET /motoristas - Iniciando');
        console.log('Usuário autenticado:', req.user);
        
        const motoristas = await Motorista.find()
            .select('-__v')
            .sort({ nome: 1 });
            
        console.log(`Motoristas encontrados: ${motoristas.length}`);
        res.json(motoristas);
    } catch (error) {
        console.error('Erro ao listar motoristas:', error);
        res.status(500).json({ message: 'Erro ao buscar motoristas' });
    }
});

// Rota para atualizar status do motorista
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ativo', 'inativo', 'suspenso'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        const motorista = await Motorista.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!motorista) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }

        res.json({
            message: 'Status atualizado com sucesso',
            motorista
        });
    } catch (error) {
        console.error('Erro ao atualizar status do motorista:', error);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
});

// Rota para verificar senha do motorista
router.post('/verificar-senha', async (req, res) => {
    try {
        const { senha } = req.body;
        const motoristaId = req.user._id; // Obtém o ID do motorista do token

        const motorista = await Motorista.findById(motoristaId);
        if (!motorista) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }

        const senhaCorreta = await bcrypt.compare(senha, motorista.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        res.json({ message: 'Senha correta' });
    } catch (error) {
        console.error('Erro ao verificar senha:', error);
        res.status(500).json({ message: 'Erro ao verificar senha' });
    }
});

// Rota para buscar dados do motorista logado
router.get('/me', auth, async (req, res) => {
    try {
        console.log('=== Buscando dados do motorista logado ===');
        console.log('URL:', req.originalUrl);
        console.log('Headers:', req.headers);
        console.log('Usuário autenticado:', req.user);
        console.log('ID do usuário:', req.user.userId);
        
        const motorista = await Motorista.findOne({ usuario: req.user.userId });
        console.log('Resultado da busca:', motorista ? 'Motorista encontrado' : 'Motorista não encontrado');
        
        if (!motorista) {
            console.log('Motorista não encontrado para o usuário:', req.user.userId);
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }
        
        console.log('Motorista encontrado:', motorista);
        res.json(motorista);
    } catch (error) {
        console.error('Erro ao buscar motorista:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Erro ao buscar dados do motorista' });
    }
});

export default router; 