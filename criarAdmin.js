import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario } from './models/Usuario.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv com o caminho absoluto para a raiz do projeto
const rootPath = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootPath, '.env') });

const criarAdmin = async () => {
    try {
        // Conectar ao MongoDB
        await mongoose.connect('mongodb://localhost:27017/vanscontrol', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado ao MongoDB');

        // Verificar se já existe um admin
        const adminExistente = await Usuario.findOne({ tipo: 'admin' });
        if (adminExistente) {
            console.log('Já existe um administrador cadastrado!');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Criar hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash('admin123456', salt);

        // Criar usuário administrador
        const novoAdmin = new Usuario({
            tipo: 'admin',
            email: 'admin@gmail.com',
            senha: hashSenha
        });

        await novoAdmin.save();
        console.log('Administrador criado com sucesso!');
        console.log('Email: admin@gmail.com');
        console.log('Senha: admin123456');
        
        // Desconectar do MongoDB
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar administrador:', error);
        process.exit(1);
    }
};

criarAdmin(); 