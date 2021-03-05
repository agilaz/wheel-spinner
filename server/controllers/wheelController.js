import Wheel from '../models/wheel.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const getAllTitles = async (req, res) => {
    await Wheel.find()
        .select('title')
        .exec((err, wheels) => {
            if (err) return res.status(400).json({success: false, error: err});
            return res.status(200).json({titles: wheels.map(wheel => wheel.title)});
        });
}

export const getWheelById = async (req, res) => {
    await Wheel.findOne({_id: req.params.id}, (err, wheel) => {
        if (err) return res.status(400).json({success: false, error: err});
        return res.status(200).json(wheel);
    });
}

export const findWheel = async (req, res) => {
    await Wheel.findOne(req.body, (err, wheel) => {
        if (err) return res.status(400).json({success: false, error: err});
        return res.status(200).json(wheel);
    });
}

export const createWheel = (req, res) => {
    const body = req.body;

    if (!body) {
        return res.status(400).json({success: false, error: 'Must provide body'});
    }

    if (!body.password) {
        return res.status(400).json({success: false, error: 'Must set password'});
    }

    if (!body.wedges || !body.wedges.length) {
        return res.status(400).json({success: false, error: 'Must set wedges'});
    }

    if (body.wedges.some(wedge => !wedge.weight || wedge.weight <= 0)) {
        return res.status(400).json({success: false, error: 'Wedges must have positive weights'});
    }

    const {password, ...saveData} = body;

    const wheel = new Wheel({
        ownerHash: bcrypt.hashSync(body.password, SALT_ROUNDS),
        ...saveData
    });

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
        return res.status(400).json({success: false, error: 'Must provide body'});
    }

    if (!req.query.password) {
        return res.status(400).json({success: false, error: 'Must provide password'});
    }

    if (body.wedges) {
        if (body.wedges.some(wedge => !wedge.weight || wedge.weight <= 0)) {
            return res.status(400).json({success: false, error: 'Wedges must have positive weights'});
        }
    }

    const validPassword = await isMatchingPassword(req.params.id, req.query.password)

    if (!validPassword) {
        return res.status(404).send();
    }

    Wheel.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, wheel) => {
        if (err) return res.status(400).json({success: false, error: err});
        return res.status(200).json(wheel);
    });
}

export const validatePassword = async (req, res) => {
    if (!req.query.password) {
        return res.status(400).json({success: false, error: 'Must provide password'})
    }

    const matches = await isMatchingPassword(req.params.id, req.query.password);

    if (!matches) {
        return res.status(404).send();
    }

    return res.status(204).send();
}

const isMatchingPassword = async (_id, pass) => {
    let existingWheel;
    try {
        existingWheel = await Wheel.findOne({_id}).select('ownerHash');
    } catch (err) {
        return false;
    }

    return await bcrypt.compare(pass, existingWheel.ownerHash);
}