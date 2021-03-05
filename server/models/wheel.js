import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Wheel = new Schema(
    {
        ownerHash: {type: String, required: true, select: false, immutable: true},
        wedges: [{
            label: String,
            description: String,
            weight: Number,
            hidden: Boolean
        }],
        title: {type: String, required: true, unique: true},
        spinSound: {type: String},
        winSound: {type: String},
        minSpins: {type: Number},
        maxSpins: {type: Number},
        minSpinDurationMillis: {type: Number},
        maxSpinDurationMillis: {type: Number},
        isRemoveOnSpin: {type: Boolean}
    }
);

export default mongoose.model('wheels', Wheel);