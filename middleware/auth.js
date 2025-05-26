import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        console.log('=== Middleware de Autenticação ===');
        console.log('URL:', req.originalUrl);
        console.log('Método:', req.method);
        console.log('Headers:', req.headers);
        
        // Verifica se o header Authorization existe
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('Header Authorization não encontrado');
            return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
        }

        // Verifica se o token está no formato correto
        if (!authHeader.startsWith('Bearer ')) {
            console.log('Token não está no formato Bearer');
            return res.status(401).json({ message: 'Formato de token inválido.' });
        }

        // Extrai o token
        const token = authHeader.replace('Bearer ', '');
        console.log('Token recebido:', token);
        
        // Verifica se o JWT_SECRET está definido
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não está definido no ambiente');
            return res.status(500).json({ message: 'Erro de configuração do servidor.' });
        }

        try {
            // Tenta decodificar o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decodificado com sucesso:', decoded);
            
            // Verifica se o token contém as informações necessárias
            if (!decoded.userId || !decoded.tipo) {
                console.log('Token não contém informações necessárias');
                return res.status(401).json({ message: 'Token inválido: informações ausentes.' });
            }

            // Adiciona as informações do usuário à requisição
            req.user = decoded;
            console.log('Autenticação bem-sucedida para usuário:', decoded.userId);
            next();
        } catch (jwtError) {
            console.error('Erro ao verificar token:', jwtError);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
            }
            return res.status(401).json({ message: 'Token inválido.' });
        }
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export default auth; 