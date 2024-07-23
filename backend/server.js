const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('node:fs');
const {promisify} = require('util');
const main = require('./script');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();

const upload = multer({storage: storage});

app.post('/upload', upload.fields([{ name: 'sfFile' }, { name: 'odFile' }]), async (req, res) => {
    try {
        //console.log('Files:', req.files);
        //console.log('Body:', req.body);

        if (!req.files.sfFile || !req.files.odFile){
            throw new Error('Both files must be uploaded');
        }

        const sfFile = req.files.sfFile[0];
        const odFile = req.files.odFile[0];

        const sfFilePath = `/tmp/${sfFile.originalname}`;
        const odFilePath = `/tmp/${odFile.originalname}`;
        //Save files to temporary paths
        await writeFile(sfFilePath, sfFile.buffer);
        await writeFile(odFilePath, odFile.buffer);

        const userInput = req.body.userInput || {};

        const result = main(sfFilePath, odFilePath, userInput);

        await unlink(sfFilePath);
        await unlink(odFilePath);

        res.status(200).json(JSON.parse(result));
    } catch (error) {
        if (error.message.includes('incorrect password')) {
            res.status(200).json({passwordRequired: true});
        } else{
            console.error(error);
            res.status(500).json({error: error.message});
        }
    }
});

app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}`)
});
