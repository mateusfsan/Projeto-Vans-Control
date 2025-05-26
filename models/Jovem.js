import mongoose from 'mongoose';

const jovemSchema = new mongoose.Schema({
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
        unique: true,
        sparse: true,
        trim: true
    },
    registroFamiliar: { 
        type: String, 
        required: true,
        trim: true,
        ref: 'Pai'
    },
    enderecoBusca: {
        type: String,
        required: true,
        trim: true
    },
    cepBusca: {
        type: String,
        required: true,
        trim: true
    },
    escola: {
        nome: {
            type: String,
            required: true,
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
        horarioEntrada: {
            type: String,
            required: true
        },
        horarioSaida: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo'],
        default: 'ativo'
    }
}, {
    timestamps: true
});

export const Jovem = mongoose.model('Jovem', jovemSchema); 