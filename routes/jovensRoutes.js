import express from 'express';
import { Jovem } from '../models/Jovem.js';
import { Pai } from '../models/Pai.js';

const router = express.Router();

// Rota para listar todos os jovens
router.get('/', async (req, res) => {
    try {
        console.log('Buscando todos os jovens...');
        const jovens = await Jovem.find()
            .select('nome enderecoBusca')
            .sort({ nome: 1 });
            
        console.log(`Jovens encontrados: ${jovens.length}`);
        res.json(jovens);
    } catch (error) {
        console.error('Erro ao listar jovens:', error);
        res.status(500).json({ message: 'Erro ao buscar jovens' });
    }
});

// Rota para cadastro de jovens
router.post('/', async (req, res) => {
    try {
        const {
            nome, dataNascimento, cpf, registroFamiliar,
            enderecoBusca, cepBusca, escola
        } = req.body;

        // Verifica se o RF existe
        const pai = await Pai.findOne({ registroFamiliar });
        if (!pai) {
            return res.status(400).json({ message: 'Registro Familiar não encontrado' });
        }

        // Se CPF foi fornecido, verifica se já existe
        if (cpf) {
            const jovemExistente = await Jovem.findOne({ cpf });
            if (jovemExistente) {
                return res.status(400).json({ message: 'CPF já cadastrado' });
            }
        }

        // Cria o registro do jovem
        const novoJovem = new Jovem({
            nome,
            dataNascimento,
            cpf,
            registroFamiliar,
            enderecoBusca,
            cepBusca,
            escola
        });

        await novoJovem.save();

        res.status(201).json({
            message: 'Cadastro realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro no cadastro de jovem:', error);
        res.status(500).json({ message: 'Erro ao realizar cadastro' });
    }
});

// Rota para listar jovens por RF
router.get('/familia/:registroFamiliar', async (req, res) => {
    try {
        const { registroFamiliar } = req.params;
        const jovens = await Jovem.find({ registroFamiliar })
            .select('-__v')
            .sort({ nome: 1 });

        if (!jovens.length) {
            return res.status(404).json({ message: 'Nenhum jovem encontrado para este RF' });
        }

        res.json(jovens);
    } catch (error) {
        console.error('Erro ao listar jovens:', error);
        res.status(500).json({ message: 'Erro ao buscar jovens' });
    }
});

// Rota para atualizar status do jovem
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ativo', 'inativo'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        const jovem = await Jovem.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!jovem) {
            return res.status(404).json({ message: 'Jovem não encontrado' });
        }

        res.json({
            message: 'Status atualizado com sucesso',
            jovem
        });
    } catch (error) {
        console.error('Erro ao atualizar status do jovem:', error);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
});

// Rota para atualizar dados escolares do jovem
router.patch('/:id/escola', async (req, res) => {
    try {
        const { id } = req.params;
        const { escola } = req.body;

        const jovem = await Jovem.findByIdAndUpdate(
            id,
            { escola },
            { new: true }
        );

        if (!jovem) {
            return res.status(404).json({ message: 'Jovem não encontrado' });
        }

        res.json({
            message: 'Dados escolares atualizados com sucesso',
            jovem
        });
    } catch (error) {
        console.error('Erro ao atualizar dados escolares:', error);
        res.status(500).json({ message: 'Erro ao atualizar dados' });
    }
});

// Rota para listar todos os jovens
router.get('/familia/todos', async (req, res) => {
    try {
        const jovens = await Jovem.find()
            .select('nome enderecoBusca')
            .sort({ nome: 1 });
        
        if (!jovens || jovens.length === 0) {
            return res.json([]);
        }
        
        res.json(jovens);
    } catch (error) {
        console.error('Erro ao listar jovens:', error);
        res.status(500).json({ message: 'Erro ao buscar jovens' });
    }
});

export default router; 