//imports
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const app = express();
//write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
//logger
app.use(morgan('combined', {stream: accessLogStream}));

//returns all files in public
app.use(express.static('public'));

let myMovies = [
{
title: 'Inception',
director: 'Christopher Nolan',
release_date: 'July 13, 2010'
},
{
title: '1408',
director: 'Mikael Håfström',
release_date: 'June 22, 2007'
},
{
title: 'interstellar',
director: 'Christopher Nolan',
release_date: 'October 26, 2014'
},
{
title: 'Pulp Fiction',
director: 'Quentin Tarantino',
release_date: 'July 13, 2010'
},
{
title: 'The Machinist',
director: 'Brad Anderson',
release_date: 'January 18, 2004'
},
{
title: 'Django Unchained',
director: 'Django Unchained',
release_date: 'Django Unchained'
},
{
title: 'Fight Club',
director: 'David Fincher',
release_date: 'November 11, 1999'
},
{
title: 'Inglourious Basterds',
director: 'Quentin Tarantino',
release_date: 'August 21, 2009'
},
{
title: 'American Psycho',
director: 'Mary Harron',
release_date: 'April 14, 2000'
},
{
title: 'Reservoir Dogs',
director: 'Quentin Tarantino',
release_date: 'October 8, 1992 '
},
];
//GET request
app.get('/', (req, res) => {
res.send('Welcome to my movie club!');
});

app.get('/movies', (req, res) => {
    res.json(myMovies);
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
