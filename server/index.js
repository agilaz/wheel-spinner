import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import wheelRouter from './routes/wheelRouter.js';

const DEV_PORT = 3001;
const DEV_DB_URL = 'mongodb://127.0.0.1:27017/wheelSpinner?gssapiServiceName=mongodb';
const PORT = process.env.PORT || DEV_PORT;
const mongoDB = process.env.MONGODB_URI || DEV_DB_URL;

const __dirname = path.resolve();

// Set up mongoose connection
const app = express();
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).catch(e => {
    console.error('Connection error', e.message)
});


app.use(express.json());

app.use(express.static(path.resolve(__dirname, './client/build')));

app.use('/api', wheelRouter);

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
})

app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});
