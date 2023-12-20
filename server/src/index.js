const express = require('express'); //external module for using express
const { Client } = require('pg') //external module for using postgres with node (database client, not frontend user client)
const config = require('./config.js'); // internal module for connecting to our config file

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client(config); //creating our database Client with our config values

const getCities = async () => {
    await client.connect() //connecting to our database
    const result = await client.query(`SELECT * FROM saved_city`);
    console.log(result.rows);
    await client.end() //ending the connection
    return result.rows;
}

app.get('/get-cities', async (req, res) => {
    const cities = await getCities();
    //This will allow us to connect our localhost frontend to make the API call. Check to see if your port is the same. Without this extra code, the browser will throw an error because it will think there is a security risk.
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500').send(cities);
});

app.listen(port, () => {
    console.log(`Weathery app listening at http://localhost:${port}`);
});