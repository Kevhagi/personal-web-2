const express = require('express')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')

const app = express()
const db = require('./connection/db')
const upload = require('./middlewares/fileUpload')

app.set('view engine', 'hbs')

app.use('/public', express.static(__dirname + '/public'))

app.use('/uploads', express.static(__dirname + '/uploads'))

//is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. 
//This method is called as a middleware in your application.
app.use(express.urlencoded({extended: false}))

app.use(session({
    cookie : {
        maxAge : 2 * 60 * 60 * 1000,
        secure : false,
        httpOnly : true
    },
    secret: 'secretValue',
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore()
}))

app.use(flash())

// formatting & penampung data
function getFullTime(time) { 
    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    let date = time.getDate();
    let monthIndex = time.getMonth();
    let year = time.getFullYear();

    let hours = time.getHours();
    let minutes = time.getMinutes();

    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes}` //10 January 2022 12:34

    return fullTime
}

function getDistanceTime(time) {
    let timePost = time
    let timeNow = new Date()

    let distance = timeNow - timePost

    // convert milisecond => hari
    let milisecond = 1000 // mili -> second
    let minutes = 3600 // second -> jam
    let hoursInDay = 23 // jam -> hari

    let distanceDay = distance / (milisecond * minutes * hoursInDay)
    let distanceHours = distance / (milisecond * minutes)
    let distanceMinutes = distance / (milisecond * 60)
    let distanceSeconds = distance / milisecond

    distanceDay = Math.floor(distanceDay)
    distanceHours = Math.floor(distanceHours)
    distanceMinutes = Math.floor(distanceMinutes)
    distanceSeconds = Math.floor(distanceSeconds)

    if(distanceDay >=1){
        return `${distanceDay} days ago`;
    } else {
        if(distanceHours >=1){
            return `${distanceHours} hours ago`;
        } else{
            if(distanceMinutes >=1){
                return `${distanceMinutes} minutes ago`;
            } else{
                    return `${distanceSeconds} seconds ago`;
                }
            }
        }
}


// GET
app.get('/', function (request, response) {

    db.connect(function(err, client, done) {
        if (err) {
            throw err
        }

        client.query('SELECT * FROM tb_experience', function(err, result) {
            if (err) {
                throw err
            }

            let dataDB = result.rows

            response.render('index.hbs', {experience : dataDB})
        })
    })

    
})

app.get('/blog', function (request, response) {

    let query = `SELECT tb_blog.id, author_id, tb_user.name, title, image, content, "postAt"
	FROM public.tb_blog LEFT JOIN tb_user ON tb_blog.author_id = tb_user.id ORDER BY "postAt" DESC;`

    db.connect(function(err, client, done) {
        /*if (err) {
            throw err
        }*/

        client.query(query, function(err, result) {
            if (err) {
                throw err
            }

            let dataDB = result.rows

            let blogsData = dataDB.map(function (data) {

                data.dateFormat = getFullTime(data.postAt)
                data.distanceTime = getDistanceTime(data.postAt)
                
                return data
            })

            response.render('blog.hbs', {isLogin : request.session.isLogin, username : request.session.user ,blogs : blogsData})
        })
    })
})

app.get('/add-blog', function (request, response) {
    
    if(!request.session.isLogin){
        response.redirect('/blog')
    }
    else{
        response.render('add-blog.hbs')
    }

})

app.get('/register', function (request, response) {
    response.render('register.hbs')
})

app.get('/login', function (request, response) {
    response.render('login.hbs')
})

app.get('/blog-detail/:id', function (request, response) {

    let blogId = request.params.id

    let query = `SELECT * FROM tb_blog WHERE id = ${blogId}`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) {
                throw err
            }

            let dataDB = result.rows
            
            let dataMap = dataDB.map(function (data) {

                data.dateFormat = getFullTime(data.postAt)
                
                return data
            })

            response.render('blog-detail.hbs', {id : blogId, dataDetail : dataMap})
        })
    })
})

app.get('/edit-blog/:id', function (request, response) {

    let blogId = request.params.id

    let query = `SELECT * FROM tb_blog WHERE id = ${blogId} `

    if(!request.session.isLogin){
        response.redirect('/blog')
    }
    else{
        db.connect(function (err, client, done) {
            if (err) {
                throw err
            }

            client.query(query, function (err,result) {
                if (err) {
                    throw err
                }

                data = result.rows[0]

                response.render('edit-blog.hbs', {dataEdit : data, blogId : blogId})
            })
        })
    }
})

app.get('/delete-blog/:id', function (request, response) {
    
    let blogId = request.params.id

    let query = `DELETE FROM tb_blog WHERE id = ${blogId}`

    if(!request.session.isLogin){
        response.redirect('/blog')
    }
    else{
        db.connect(function(err, client, done) {
            if (err) {
                throw err
            }

            client.query(query, function(err, result) {
                if (err) {
                    throw err
                }

                response.redirect('/blog')
            })
        }) 
    } 
})

app.get('/contact', function (request, response) {
    response.render('contact.hbs')
})

app.get('/logout', function(request, response) {
    request.session.destroy()
    response.redirect('/blog')
})


// POST
app.post('/blog',upload.single('inputImage') ,function (request, response) {

    let body = request.body

    let authorId = request.session.user.id

    let image = request.file.filename

    let query = `INSERT INTO tb_blog(title, content, image, author_id) VALUES ('${body.inputTitle}', '${body.inputContent}', '${image}', '${authorId}')`

    db.connect(function(err, client){
        if (err) {
            throw err
        }

        client.query(query, function(err, result){
            if (err) {
                throw err
            }
            response.redirect('/blog')
        })
    })    
})

app.post('/register', function (request, response) {
    let body = request.body

    const hashedPassword = bcrypt.hashSync(body.inputPassword, 10)

    let check = `SELECT * FROM tb_user WHERE email = '${body.inputEmail}'`

    let query = `INSERT INTO tb_user (name, email, password) VALUES ('${body.inputName}', '${body.inputEmail}', '${hashedPassword}')`

    db.connect(function(err, client, done) {
        if (err) {
            throw err
        }

        if(body.inputName != '' && body.inputEmail != '' && body.inputPassword != ''){
            client.query(check, function(err,result){
                if (err) {
                    throw err
                }

                if(result.rows.length == 0){
                    client.query(query, function(err, result) {
                        if (err) {
                            throw err
                        }
                        request.flash('success', 'Registrasi sukses!')
                        response.redirect('/login')
                    })
                } else {
                    request.flash('danger', 'Email telah terdaftar!')
                    response.redirect('/register')
                }
            })
        }
    })
})

app.post('/login', function(request, response) {
    const {inputEmail, inputPassword} = request.body
    let query = `SELECT * FROM tb_user WHERE email = '${inputEmail}'`

    db.connect(function(err, client, done) {
        if (err) {
            throw err
        }

        if(inputEmail != '' && inputPassword != ''){
            client.query(query, function(err, result) {
                if (err) {
                    throw err
                }

                if (result.rows.length == 0) {
                    request.flash('danger', 'Email belum terdaftar!')
                    return response.redirect('/login')
                }
                
                const isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)

                if(isMatch){
                    request.session.isLogin = true
                    request.session.user = {
                        id : result.rows[0].id,
                        name : result.rows[0].name,
                        email : result.rows[0].email
                    }
                    request.flash('success', 'Login sukses!')
                    response.redirect('/blog')
                }
                else{
                    request.flash('danger', 'Password yang dimasukkan salah!')
                    response.redirect('/login')
                }
            })
        }
    })
})

app.post('/edit-blog/:id', function (request, response) { 

    let blogId = request.params.id
    let body = request.body
    let authorId = request.session.user.id

    let query = `UPDATE tb_blog SET title='${body.inputTitle}', content='${body.inputContent}', author_id='${authorId}' WHERE id = ${blogId}`

    db.connect(function(err, client, done) {
        if (err) {
            throw err
        }

        client.query(query, function(err, result) {
            if (err) {
                throw err
            }

            response.redirect('/blog')
        })
    })
})


// Indikator server nyala
app.listen(process.env.PORT || 5432, function() {
    console.log(`Server jalan di PORT ${process.env.PORT}`);
})