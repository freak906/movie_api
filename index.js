//imports
const { dir } = require('console');
const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const { title } = require('process');

const app = express();
//write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//logger
app.use(morgan('combined', {stream: accessLogStream}));

//returns all files in public
app.use(express.static('public'));
app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: 'Nick',
        favoriteMovie: [],

    },
    {
        id: 2,
        name: 'Matt',
        favoriteMovie: ['Coco']
    }
];

let myMovies = [
{
title: 'Inception',
director: {
    name: "Cristopher Nolan",
    bio: "placeholder bio",
    birth_year: "1970"
  },
genre: { 
    name: 'Fiction'
},
release_date: 'July 13, 2010',
imageUrl: "link to image URL",
featured:false
},
{
title: '1408',
director: {
    name: "Mikael Håfström",
    bio: "placeholder bio",
    birth_year: "1960"
},
genre: {
    name: 'Horror'
},
release_date: 'June 22, 2007',
imageUrl: "link to image URL",
featured:false
},
{
title: 'interstellar',
director: {
    name: "Cristopher Nolan",
    bio: "placeholder bio",
    birth_year: "1970"
},
genre: { 
    name: 'Fiction'
},
release_date: 'October 26, 2014',
imageUrl: "link to image URL",
featured:false
},
{
title: 'Pulp Fiction',
director: {
    name: "Quentin Tarantino",
    bio: "placeholder bio",
    birth_year: "1963"
},
  genre: {
    name: 'Thriller'
},
release_date: 'July 13, 2010',
imageUrl: "link to image URL",
featured:false
},
{
title: 'The Machinist',
director: {
    name: "Brad Anderson",
    bio: "placeholder bio",
    birth_year: "1964"
},
genre: {
    name: 'Thriller'
},
release_date: 'January 18, 2004',
imageUrl: "link to image URL",
featured:false
},
{
title: 'Django Unchained',
director: {
    name: "Quentin Tarantino",
    bio: "placeholder bio",
    birth_year: "1963"
},
genre: { 
    name: 'Western'
},
release_date: 'Django Unchained',
imageUrl: "link to image URL",
featured:false
},
{
title: 'Fight Club',
director: 'David Fincher',
genre: {
    name: 'Thriller'
},
release_date: 'November 11, 1999',
imageUrl: "link to image URL",
featured:false
},
{
title: 'Inglourious Basterds',
director: {
    name: "Quentin Tarantino",
    bio: "placeholder bio",
    birth_year: "1963"
},
genre: { 
    name: 'Western'
},
release_date: 'August 21, 2009',
imageUrl: "link to image URL",
featured:false
},
{
title: 'American Psycho',
director: {
    name: "Marry Harron",
    bio: "placeholder bio",
    birth_year: "1953"
},
genre: {
    name: 'Thriller'
},
release_date: 'April 14, 2000',
imageUrl: "link to image URL",
featured:false
},
{
title: 'Reservoir Dogs',
director: {
    name: "Quentin Tarantino",
    bio: "placeholder bio",
    birth_year: "1963"
},
genre: {
    name: 'Thriller'
},
release_date: 'October 8, 1992',
imageUrl: "link to image URL",
featured:false
}
];



//GET request
app.get('/', (req, res) => {
res.send('Welcome to my movie club!');
});

//return all movie
app.get('/movies', (req, res) => {
    res.json(myMovies);
});

//return single movie
app.get('/movies/:title', (req, res) => {
    res.json(myMovies.find((movie) => {
        return movie.title === req.params.title
    }));
});

//return  director by name
app.get('/movies/director/:directorName', (req, res) => {
    const {directorName} = req.params;
    const director = myMovies.find(movie => movie.director.name === directorName).director;
  
    if (director) {
      res.status(200).json(director);
    } else {
      res.status(400).send('Director was not found.')
    }
  });

//return genre by title
app.get('/movies/genre/:genreName', (req, res) => {
    const {genreName} = req.params;
    const genre = myMovies.find(movie => movie.genre.name === genreName).genre;
  
    if (genre) {
      res.status(200).json(genre);
    } else {
      res.status(400).send('Genre was not found');
    }
  });

//new users
app.post('/users', (req, res) =>{
    let newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    } else {
        res.status(400).send('User name required.');
    }
});

//update name
app.put('/users/:id', (req, res) => {
    const {id} = req.params;
    let updateUser = req.body;
    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updateUser.name;
        res.status(201).json("User's name has been successfully changed to " + JSON.stringify(user) + '.');
    } else { 
        res.status(404).send('User was not found.');
    }
});

//add favorite movie
app.post('/users/:id/:newFavoriteMovie', (req, res) => {
    const {id, newFavoriteMovie} = req.params;
    let user = users.find(user => user.id ==id);

    if (!user) {
        res.status(400).send('User was not found.')
    } else {
        user.favoriteMovie.push(newFavoriteMovie);
        res.status(201).send('Movie has been added.')
    }
});

//remove favorite movie
app.delete('/users/:id/:removeFavoriteMovie', (req, res) => {
    const {id, removeFavoriteMovie} = req.params;
    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovie = user.favoriteMovie.filter(title => title != removeFavoriteMovie);
        res.status(201).send('Movie has been removed from the list.');
    } else {
        res.status(400).send('Nothing to remove');
    }
});

//remove user by name
app.delete('/users/:id', (req, res) => {
    const {id} = req.params;
    let user = users.find(user => user.id ==id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(201).send(JSON.stringify(user) + ' has been succsessfully removed.');
    } else {
        res.status(400).send('User was not found');
    }
});

//error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
});
//listen to port 8080
app.listen(8080, () => {
console.log('Your app is listening on port 8080.');
});
