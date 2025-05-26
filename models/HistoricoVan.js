import mongoose from 'mongoose';

const historicoVanSchema = new mongoose.Schema({
    jovem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jovem',
        required: true
    },
    registroFamiliar: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['entrada', 'saida'],
        required: true
    },
    escola: {
        type: String,
        required: true
    },
    horario: {
        type: Date,
        required: true,
        default: Date.now
    },
    tipoRegistro: {
        type: String,
        enum: ['rfid', 'manual'],
        required: true,
        default: 'rfid'
    },
    motorista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motorista',
        required: function() {
            return this.tipoRegistro === 'manual';
        }
    }
}, {
    timestamps: true
});

// Índices para melhorar a performance das consultas
historicoVanSchema.index({ registroFamiliar: 1, horario: -1 });
historicoVanSchema.index({ jovem: 1, horario: -1 });
historicoVanSchema.index({ tipo: 1, horario: -1 });

export const HistoricoVan = mongoose.model('HistoricoVan', historicoVanSchema); 