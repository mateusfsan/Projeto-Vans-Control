import mongoose from 'mongoose';

const rotaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    motoristaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motorista',
        required: true
    },
    cnh: {
        type: String,
        required: true
    },
    pontos: [{
        ordem: {
            type: Number,
            required: true
        },
        jovem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jovem',
            required: true
        },
        nomeJovem: {
            type: String,
            required: true
        },
        enderecoBusca: {
            type: String,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['ativa', 'inativa'],
        default: 'ativa'
    }
}, {
    timestamps: true
});

export const Rota = mongoose.model('Rota', rotaSchema); 