const { Pool} = require('pg')
const fs = require('fs');

const currentFileContents = fs.readFileSync("credentials.txt", 'utf-8');
var credentials = currentFileContents.split("#");
const dbCredentials = new Pool({
  user: credentials[0],
  database: credentials[1],
  password: credentials[2],
  port: 5432,
  host: credentials[3],
})

module.exports = { dbCredentials };
