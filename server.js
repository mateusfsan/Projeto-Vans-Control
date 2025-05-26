import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from './config/database.js';
import routes from './routes/index.js';
import { login, setupAdmin } from './routes/authRoutes.js';
import { wsManager } from './websocket.js';
import http from 'http';
import mongoose from 'mongoose';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv com o caminho absoluto para a raiz do projeto
const rootPath = path.resolve(__dirname, '..');
const envPath = path.join(rootPath, '.env');

console.log('=== Configuração do Ambiente ===');
console.log('Diretório atual:', process.cwd());
console.log('Diretório do arquivo:', __dirname);
console.log('Caminho raiz:', rootPath);
console.log('Caminho do .env:', envPath);
console.log('Arquivo .env existe:', existsSync(envPath));

// Carregar variáveis de ambiente
dotenv.config({ path: envPath });

// Log das variáveis de ambiente
console.log('=== Variáveis de Ambiente ===');
console.log('JWT_SECRET carregado:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET valor:', process.env.JWT_SECRET ? 'Presente' : 'Ausente');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Definir JWT_SECRET padrão se não estiver definido
if (!process.env.JWT_SECRET) {
    console.log('JWT_SECRET não encontrado, usando valor padrão');
    process.env.JWT_SECRET = 'vanscontrol_secret_key_2024';
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/vanscontrol', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Log para debug das rotas
app.use((req, res, next) => {
    console.log('=== Nova requisição ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    next();
});

// Configurar rotas
console.log('Registrando rotas de autenticação...');
app.post('/api/auth/login', login);
app.post('/api/auth/setup-admin', setupAdmin);
console.log('Registrando rotas da API...');
app.use('/api', routes);

// Log para debug das rotas registradas
console.log('=== Rotas registradas ===');
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log('Rota registrada:', r.route.stack[0].method.toUpperCase(), r.route.path);
    } else if (r.name === 'router') {
        console.log('Router registrado:', r.regexp);
    }
});

// Servir arquivos estáticos do frontend e admin
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// Rota principal - serve o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Rota para a página de admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/pag-admin.html'));
});

// Rota para a página do motorista
app.get('/motorista', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-motorista.html'));
});

// Rota para a página do pai
app.get('/pai', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-pais.html'));
});

// Rotas para as páginas de cadastro do admin
app.get('/admin/cadastro-pais', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/cadastro-pais.html'));
});

app.get('/admin/cadastro-jovens', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/cadastro-jovens.html'));
});

app.get('/admin/cadastro-motoristas', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/cadastro-motoristas.html'));
});

// Rota de teste da API
app.get('/api', (req, res) => {
    res.json({ message: 'API VansControl funcionando!' });
});

// Rota para capturar todas as outras requisições para arquivos estáticos do admin
app.get('/admin/*', (req, res) => {
    const filePath = path.join(__dirname, '../frontend', req.path);
    res.sendFile(filePath);
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err.stack);
    if (err.code === 'ENOENT') {
        res.status(404).json({ message: 'Arquivo não encontrado' });
    } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Inicializa o servidor HTTP
const server = http.createServer(app);

// Inicializa o WebSocket
wsManager.initialize(server);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Rotas disponíveis:');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/setup-admin');
    console.log('- GET /api');
}); 