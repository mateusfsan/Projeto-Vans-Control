import express from 'express';
import { Rota } from '../models/Rota.js';
import { Motorista } from '../models/Motorista.js';
import { Jovem } from '../models/Jovem.js';

const router = express.Router();

// Rota para cadastrar uma nova rota
router.post('/', async (req, res) => {
    try {
        const { nome, motoristaId, pontos } = req.body;

        // Busca o motorista para obter a CNH
        const motorista = await Motorista.findById(motoristaId);
        if (!motorista) {
            return res.status(404).json({ message: 'Motorista não encontrado' });
        }

        // Cria a nova rota
        const novaRota = new Rota({
            nome,
            motoristaId: motoristaId,
            cnh: motorista.cnh,
            pontos: pontos.map((ponto, index) => ({
                ordem: index + 1,
                jovem: ponto.jovemId,
                nomeJovem: ponto.nomeJovem,
                enderecoBusca: ponto.enderecoBusca
            }))
        });

        await novaRota.save();

        res.status(201).json({
            message: 'Rota cadastrada com sucesso',
            rota: novaRota
        });
    } catch (error) {
        console.error('Erro ao cadastrar rota:', error);
        res.status(500).json({ message: 'Erro ao cadastrar rota' });
    }
});

// Rota para listar todas as rotas
router.get('/', async (req, res) => {
    try {
        const rotas = await Rota.find()
            .populate('motorista', 'nome cnh')
            .populate('pontos.jovem', 'nome enderecoBusca')
            .sort({ nome: 1 });

        res.json(rotas);
    } catch (error) {
        console.error('Erro ao listar rotas:', error);
        res.status(500).json({ message: 'Erro ao listar rotas' });
    }
});

// Rota para buscar rota por ID
router.get('/:id', async (req, res) => {
    try {
        const rota = await Rota.findById(req.params.id)
            .populate('motorista', 'nome cnh')
            .populate('pontos.jovem', 'nome enderecoBusca');

        if (!rota) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        res.json(rota);
    } catch (error) {
        console.error('Erro ao buscar rota:', error);
        res.status(500).json({ message: 'Erro ao buscar rota' });
    }
});

// Rota para buscar rotas por motorista
router.get('/motorista/:motoristaId', async (req, res) => {
    try {
        console.log('Buscando rotas para motorista:', req.params.motoristaId);
        
        const rotas = await Rota.find({ 
            motoristaId: req.params.motoristaId,
            status: 'ativa'
        })
        .populate('pontos.jovem', 'nome enderecoBusca')
        .sort({ nome: 1 });

        console.log('Rotas encontradas:', rotas);
        res.json(rotas);
    } catch (error) {
        console.error('Erro ao buscar rotas do motorista:', error);
        res.status(500).json({ message: 'Erro ao buscar rotas do motorista' });
    }
});

// Rota para atualizar uma rota
router.put('/:id', async (req, res) => {
    try {
        const { nome, pontos } = req.body;
        const rota = await Rota.findById(req.params.id);

        if (!rota) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        rota.nome = nome;
        rota.pontos = pontos.map((ponto, index) => ({
            ordem: index + 1,
            jovem: ponto.jovemId,
            nomeJovem: ponto.nomeJovem,
            enderecoBusca: ponto.enderecoBusca
        }));

        await rota.save();

        res.json({
            message: 'Rota atualizada com sucesso',
            rota
        });
    } catch (error) {
        console.error('Erro ao atualizar rota:', error);
        res.status(500).json({ message: 'Erro ao atualizar rota' });
    }
});

// Rota para excluir uma rota
router.delete('/:id', async (req, res) => {
    try {
        const rota = await Rota.findByIdAndDelete(req.params.id);

        if (!rota) {
            return res.status(404).json({ message: 'Rota não encontrada' });
        }

        res.json({ message: 'Rota excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir rota:', error);
        res.status(500).json({ message: 'Erro ao excluir rota' });
    }
});

export default router; 