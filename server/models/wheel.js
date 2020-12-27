import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Wheel = new Schema(
    {
        ownerHash: {type: String, required: true},
        wedges: [{
            label: String,
            description: String,
            weight: Number,
            hidden: Boolean
            }]
    }
);

export default mongoose.model('wheels', Wheel);