import jwt from 'jsonwebtoken';

// Chave secreta temporária para teste
const JWT_SECRET = 'vanscontrol_secret_key_2024';

const authMiddleware = (req, res, next) => {
    try {
        // Obtém o token do header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Remove o prefixo "Bearer " do token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        // Verifica e decodifica o token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adiciona os dados do usuário decodificados à requisição
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

export default authMiddleware; 