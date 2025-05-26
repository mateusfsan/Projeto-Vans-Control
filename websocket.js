import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { HistoricoVan } from './models/HistoricoVan.js';
import { Jovem } from './models/Jovem.js';

// Chave secreta temporária para teste
const JWT_SECRET = 'vanscontrol_secret_key_2024';

class WebSocketManager {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // Map para armazenar conexões ativas
    }

    initialize(server) {
        this.wss = new WebSocketServer({ server });

        this.wss.on('connection', (ws, req) => {
            // Extrai o token da URL
            const url = new URL(req.url, 'ws://localhost');
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'Token não fornecido');
                return;
            }

            try {
                // Verifica o token
                const decoded = jwt.verify(token, JWT_SECRET);
                const { userId, tipo, registroFamiliar } = decoded;

                // Armazena informações do cliente
                ws.userId = userId;
                ws.tipo = tipo;
                ws.registroFamiliar = registroFamiliar;

                // Adiciona o cliente à lista de conexões ativas
                this.clients.set(userId, ws);

                console.log(`Cliente conectado: ${userId} (${tipo})`);

                // Envia dados iniciais baseado no tipo de usuário
                this.sendInitialData(ws);

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message);
                        this.handleMessage(ws, data);
                    } catch (error) {
                        console.error('Erro ao processar mensagem:', error);
                    }
                });

                ws.on('close', () => {
                    this.clients.delete(userId);
                    console.log(`Cliente desconectado: ${userId}`);
                });

            } catch (error) {
                console.error('Erro na autenticação WebSocket:', error);
                ws.close(1008, 'Token inválido');
            }
        });
    }

    // Envia dados iniciais baseado no tipo de usuário
    async sendInitialData(ws) {
        try {
            let data = { type: 'initialData' };

            if (ws.tipo === 'motorista') {
                // Busca dados iniciais para o motorista
                const [notifications, history] = await Promise.all([
                    this.getCurrentNotifications(),
                    this.getRecentHistory()
                ]);
                data.notifications = notifications;
                data.history = history;
            } else if (ws.tipo === 'pai') {
                // Busca dados iniciais para o pai
                const [notifications, history] = await Promise.all([
                    this.getChildNotifications(ws.registroFamiliar),
                    this.getChildHistory(ws.registroFamiliar)
                ]);
                data.notifications = notifications;
                data.history = history;
            }

            ws.send(JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao enviar dados iniciais:', error);
        }
    }

    // Manipula mensagens recebidas
    handleMessage(ws, data) {
        switch (data.type) {
            case 'getInitialData':
                this.sendInitialData(ws);
                break;
            case 'saidaManual':
                if (ws.tipo === 'motorista') {
                    this.handleManualExit(data.jovemId);
                }
                break;
        }
    }

    // Notifica sobre entrada de aluno na van
    async notifyEntry(jovemId, nome, escola, registroFamiliar) {
        const notification = {
            type: 'entrada',
            jovemId,
            nome,
            escola,
            horario: new Date().toISOString()
        };

        // Notifica o motorista
        this.notifyMotorista(notification);

        // Notifica o pai específico
        this.notifyParent(registroFamiliar, notification);
    }

    // Notifica sobre saída de aluno da van
    async notifyExit(jovemId, nome, escola, registroFamiliar) {
        const notification = {
            type: 'saida',
            jovemId,
            nome,
            escola,
            horario: new Date().toISOString()
        };

        // Notifica o motorista
        this.notifyMotorista(notification);

        // Notifica o pai específico
        this.notifyParent(registroFamiliar, notification);
    }

    // Notifica o motorista
    notifyMotorista(notification) {
        // Encontra a conexão do motorista
        const motoristaWs = Array.from(this.clients.values())
            .find(client => client.tipo === 'motorista');

        if (motoristaWs) {
            motoristaWs.send(JSON.stringify(notification));
        }
    }

    // Notifica o pai específico
    notifyParent(registroFamiliar, notification) {
        // Encontra a conexão do pai específico
        const paiWs = Array.from(this.clients.values())
            .find(client => client.tipo === 'pai' && client.registroFamiliar === registroFamiliar);

        if (paiWs) {
            paiWs.send(JSON.stringify(notification));
        }
    }

    // Funções auxiliares para buscar dados
    async getCurrentNotifications() {
        try {
            // Busca as últimas entradas que não têm saída correspondente
            const historicos = await HistoricoVan.find({
                tipo: 'entrada'
            }).sort({ horario: -1 });

            const notifications = [];
            const jovensProcessados = new Set();

            for (const historico of historicos) {
                // Verifica se já existe uma saída para esta entrada
                const saida = await HistoricoVan.findOne({
                    jovem: historico.jovem,
                    tipo: 'saida',
                    horario: { $gt: historico.horario }
                });

                if (!saida && !jovensProcessados.has(historico.jovem.toString())) {
                    const jovem = await Jovem.findById(historico.jovem);
                    if (jovem) {
                        notifications.push({
                            jovemId: jovem._id,
                            nome: jovem.nome,
                            escola: historico.escola,
                            horario: historico.horario
                        });
                        jovensProcessados.add(historico.jovem.toString());
                    }
                }
            }

            return notifications;
        } catch (error) {
            console.error('Erro ao buscar notificações atuais:', error);
            return [];
        }
    }

    async getRecentHistory() {
        try {
            const historicos = await HistoricoVan.find()
                .sort({ horario: -1 })
                .limit(50)
                .populate('jovem', 'nome');

            return historicos.map(historico => ({
                tipo: historico.tipo,
                nome: historico.jovem.nome,
                escola: historico.escola,
                horario: historico.horario,
                tipoRegistro: historico.tipoRegistro
            }));
        } catch (error) {
            console.error('Erro ao buscar histórico recente:', error);
            return [];
        }
    }

    async getChildNotifications(registroFamiliar) {
        try {
            const historicos = await HistoricoVan.find({
                registroFamiliar,
                tipo: 'entrada'
            }).sort({ horario: -1 });

            const notifications = [];
            const jovensProcessados = new Set();

            for (const historico of historicos) {
                const saida = await HistoricoVan.findOne({
                    jovem: historico.jovem,
                    tipo: 'saida',
                    horario: { $gt: historico.horario }
                });

                if (!saida && !jovensProcessados.has(historico.jovem.toString())) {
                    const jovem = await Jovem.findById(historico.jovem);
                    if (jovem) {
                        notifications.push({
                            jovemId: jovem._id,
                            nome: jovem.nome,
                            escola: historico.escola,
                            horario: historico.horario
                        });
                        jovensProcessados.add(historico.jovem.toString());
                    }
                }
            }

            return notifications;
        } catch (error) {
            console.error('Erro ao buscar notificações do filho:', error);
            return [];
        }
    }

    async getChildHistory(registroFamiliar) {
        try {
            const historicos = await HistoricoVan.find({ registroFamiliar })
                .sort({ horario: -1 })
                .limit(50)
                .populate('jovem', 'nome');

            return historicos.map(historico => ({
                tipo: historico.tipo,
                nome: historico.jovem.nome,
                escola: historico.escola,
                horario: historico.horario,
                tipoRegistro: historico.tipoRegistro
            }));
        } catch (error) {
            console.error('Erro ao buscar histórico do filho:', error);
            return [];
        }
    }

    async handleManualExit(jovemId) {
        try {
            const jovem = await Jovem.findById(jovemId);
            if (!jovem) {
                throw new Error('Jovem não encontrado');
            }

            const historico = new HistoricoVan({
                jovem: jovemId,
                registroFamiliar: jovem.registroFamiliar,
                tipo: 'saida',
                escola: jovem.escola.nome,
                horario: new Date(),
                tipoRegistro: 'manual'
            });

            await historico.save();
            console.log(`Saída manual registrada para jovem: ${jovemId}`);
        } catch (error) {
            console.error('Erro ao registrar saída manual:', error);
        }
    }
}

export const wsManager = new WebSocketManager(); 