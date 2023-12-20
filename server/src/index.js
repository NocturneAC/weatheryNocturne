const express = require('express'); //external module for using express
const Client = require('pg') //external module for using postgres with node (database client, not frontend user client)
const config = require('../config.js'); // internal module for connecting to our config file

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client(config); //creating our database Client with our config values

await client.connect() //connecting to our database


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

await client.end() //ending the connection to our database