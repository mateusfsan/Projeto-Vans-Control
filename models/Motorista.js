import mongoose from 'mongoose';

const motoristaSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    dataNascimento: {
        type: Date,
        required: true
    },
    cpf: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    cnh: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    endereco: {
        type: String,
        required: true,
        trim: true
    },
    cep: {
        type: String,
        required: true,
        trim: true
    },
    telefone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    diasTrabalho: {
        type: [{
            type: String,
            enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
        }],
        required: true,
        default: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'suspenso'],
        default: 'ativo'
    }
}, {
    timestamps: true
});

export const Motorista = mongoose.model('Motorista', motoristaSchema); 