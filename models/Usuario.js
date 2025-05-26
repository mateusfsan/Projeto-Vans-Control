import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    tipo: { 
        type: String, 
        required: true,
        enum: ['pai', 'motorista', 'admin']
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    senha: { 
        type: String, 
        required: true 
    },
    dataCriacao: { 
        type: Date, 
        default: Date.now 
    },
    ultimoAcesso: {
        type: Date
    }
});

export const Usuario = mongoose.model('Usuario', usuarioSchema); 