// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Band, Musician, Instrument } = require('./db/models');

// Express using json - DO NOT MODIFY
app.use(express.json());


// STEP 1: Creating from an associated model (One-to-Many)
app.post('/bands/:bandId/musicians', async (req, res, next) => {
    const { bandId } = req.params;
    const { firstName, lastName } = req.body;

    try {
        // find the band by ID
        const band = await Band.findByPk(bandId);

        if (!band) {
            return res.status(404).json({ message: `Band with ID ${bandId} not found.`});
        }

        // create and associate the new musician
        const musician = await band.createMusician({ firstName, lastName });

        res.status(201).json({
            message: `Created new musician for band ${band.name}.`,
            musician,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong.'});
    }
})

// STEP 2: Connecting two existing records (Many-to-Many)
app.post('/musicians/:musicianId/instruments', async (req, res, next) => {
    const { musicianId } = req.params;
    const { instrumentIds } = req.body;

    try {
        // find the musician by ID
        const musician = await Musician.findByPk(musicianId);

        if (!musician) {
            return res.status(404).json({ message: `Musician with ID ${musicianId} not found.`});
        }

        if (!Array.isArray(instrumentIds) || instrumentIds.length === 0) {
            return res.status(400).json({ message: 'Instrument IDs must be a non-empty array.' });
        }

        // associate the musician with instruments
        await musician.addInstruments(instrumentIds);

        res.status(200).json({
            message: `Associated ${musician.firstName} with instruments ${instrumentIds.join(',')}.`,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong.' });
    }
})


// Get the details of one band and associated musicians - DO NOT MODIFY
app.get('/bands/:bandId', async (req, res, next) => {
    const payload = await Band.findByPk(req.params.bandId, {
        include: { model: Musician },
        order: [[Musician, 'firstName']]
    });
    res.json(payload);
});

// Get the details all bands and associated musicians - DO NOT MODIFY
app.get('/bands', async (req, res, next) => {
    const payload = await Band.findAll({
        include: {model: Musician},
        order: [['name'], [Musician, 'firstName']]
    });
    res.json(payload);
});

// Get the details of one musician and associated instruments - DO NOT MODIFY
app.get('/musicians/:musicianId', async (req, res, next) => {
    const payload = await Musician.findByPk(req.params.musicianId, {
        include: {model: Instrument},
        order: [[Instrument, 'type']]
    });
    res.json(payload);
});

// Get the details all musicians and associated instruments - DO NOT MODIFY
app.get('/musicians', async (req, res, next) => {
    const payload = await Musician.findAll({
        include: { model: Instrument },
        order: [['firstName'], ['lastName'], [Instrument, 'type']]
    });
    res.json(payload);
});

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// Set port and listen for incoming requests - DO NOT MODIFY
if (require.main === module) {
    const port = 8000;
    app.listen(port, () => console.log('Server for Associations is listening on port', port));
  } else {
    module.exports = app;
  }
