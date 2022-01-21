const {Pool} = require('pg')

const dbPool = new Pool({
    database : 'personal_web',
    port : 6969,
    user : 'postgres',
    password : 'admin'
})

module.exports = dbPool