import Wheel from '../models/wheel.js';

export const getWheelById = async (req, res) => {
    await Wheel.findOne({_id: req.params.id}, (err, wheel) => {
        if (err) return res.status(400).json({success: false, error: err});
        return res.status(200).json(wheel);
    });
}

export const createWheel = (req, res) => {
    const body = req.body;

    if (!body) {
        return res.status(400).body({success: false, error: 'Must provide body'});
    }

    const wheel = new Wheel(body);

    wheel
        .save()
        .then(() => {
            return res.status(201).json({
                id: wheel._id
            });
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                error: err
            });
        });
}

export const updateWheel = async (req, res) => {
    const body = req.body;

    if (!body) {
        return res.status(400).body({success: false, error: 'Must provide body'});
    }

    const exists = await Wheel.exists({_id: req.params.id, ownerHash: req.query.hash});

    if (!exists) {
        return res.status(404).send();
    }

    Wheel.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, wheel) => {
        if (err) return res.status(400).json({success: false, error: err});
        return res.status(200).json(wheel);
    });
}

export const checkWheel = async (req, res) => {
    let exists;
    try {
        exists = await Wheel.exists({_id: req.params.id, ownerHash: req.query.hash});
    } catch (err) {
        return res.status(404).send();
    }

    if (!exists) {
        return res.status(404).send();
    }

    return res.status(204).send();
}