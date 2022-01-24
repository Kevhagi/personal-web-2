const {Pool} = require('pg')

const dbPool = new Pool({
    database : 'd51cch6db1f81f', //'personal_web',
    port : 5432,
    user :  'tirtuvwurrnxfb', //'postgres',
    password : '24be50d5b539e88cfd2618b0a6156e885ed479b0e658c3628d031a0b70e27c13' //'admin'
})

module.exports = dbPool