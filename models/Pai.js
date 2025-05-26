import mongoose from 'mongoose';

const paiSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: true
    },
    registroFamiliar: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    nomePai: {
        type: String,
        trim: true
    },
    dataNascPai: Date,
    cpfPai: { 
        type: String, 
        unique: true,
        sparse: true,
        trim: true
    },
    nomeMae: {
        type: String,
        trim: true
    },
    dataNascMae: Date,
    cpfMae: { 
        type: String, 
        unique: true,
        sparse: true,
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
    }
}, {
    timestamps: true
});

// Middleware para remover formatação dos CPFs antes de salvar
paiSchema.pre('save', function(next) {
    if (this.cpfPai) {
        this.cpfPai = this.cpfPai.replace(/\D/g, '');
    }
    if (this.cpfMae) {
        this.cpfMae = this.cpfMae.replace(/\D/g, '');
    }
    next();
});

export const Pai = mongoose.model('Pai', paiSchema); 