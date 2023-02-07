const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const {check, validationResult} = require('express-validator');

const Users = Models.User;
const Movies = Models.Movie;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect(process.env.CONNECTION_URI,
{useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const cors = require('cors');
app.use(cors());

/*let allowedOrigins = ['http://localhost:1234'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) {
            let message = "The CORS policy for this application doesn't allow access from origin " + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true); 
    }
}));*/

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

//start endpoints
app.get('/', (req, res) => {
res.send('Welcome to my movie club!');
});

app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.title})
    .then((movies) => {
    res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({"Director.Name": req.params.Name})
    .then((movies) => {
        res.json(movies.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/genres/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({"Genre.Name": req.params.Name})
    .then((movies) => {
        res.send(movies.Genre);
    })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
    });
});

app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: '+ err );
    });
});

app.post('/users', /*passport.authenticate('jwt', {session: false}),*/[
    check('Username', 'Username is required ').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username: req.body.Username})//search if user exist
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists.');
        } else {
            Users
            .create ({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) => {res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

app.put('/users/:Username', passport.authenticate('jwt', {session: false}), [
    check('Username', 'Username is required ').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({Username: req.params.Username},{
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    {new: true}, //make sure updated doc is returned
    (err, updatedUser) => {
        if(err) {
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
        if(!user) {
            res.status(400).send(req.params.Username + ' was not found.');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username},{
        $push: {FavoriteMovies: req.params.MovieID}
    },
    {new: true}, //make sure updated doc is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username},{
        $pull: {FavoriteMovies: req.params.MovieID}
    },
    {new: true},
    (err, updateUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updateUser);
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => { 
    console.log('Listening on port ' + port);
});