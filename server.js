const express = require('express');
const app = express();
const session = require('express-session')
const exphbs = require('express-handlebars');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const mongoose = require ('mongoose');
const dotenv = require('dotenv')
dotenv.config();
const {dataUser} = (mongoose);
const cluster = require ('cluster')
const numCPUs = require ('os').cpus().length

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = parseInt(process.argv[2]) || 8082;


/*CLUSTER*/


if (cluster.isPrimary){
    console.log(numCPUs);
    console.log(process.pid);

    for (i = 0; i < numCPUs; i++){
        cluster.fork()
    }

    // cluster.on('exit', worker => {
    //     console.log(`Worker ${worker.process.pid} is died`);
    //     cluster.fork();
    // })


} else{
    app.get('/', (req, res) =>{
        res.send(`Server in ${PORT} -- PID: ${process.pid} -- `);
    })

    app.listen(PORT, err =>{
        if (!err){
            console.log(`Server in ${PORT} --PID WORKER ${process.pid}`);
        }
    } )
}

/*--------------*/


/*-------------MONGOOSE---------------------*/


mongoose.connect(MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('strictQuery', false);

// /* ------------------ DATABASE -------------------- */

 //const usuarios = []

/* ------------------ PASSPORT -------------------- */

passport.use('register', new LocalStrategy({
    passReqToCallback: true
}, (req, email, password, done) => {

    const { direccion } = req.body

    const usuario = dataUser.find(usuario => usuario.email == email)
    if (usuario) {
        return done('already registered')
    }

    const user = {
        email,
        password,
        direccion,
    }
    dataUser.push(user)

    return done(null, user)
}));

passport.use('login', new LocalStrategy((email, password, done) => {

    const user = dataUser.find(usuario => usuario.email == email)

    if (!user) {
        return done(null, false)
    }

    if (user.password != password) {
        return done(null, false)
    }

    user.contador = 0
    return done(null, user);
}));

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (dataUser, done) {
    const usuario = dataUser.find(usuario => usuario.email == email)
    done(null, usuario);
});



/* --------------------- MIDDLEWARE --------------------------- */

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}))

app.use(passport.initialize());
app.use(passport.session());

app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main.hbs' }));
app.set('view engine', '.hbs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

/* --------------------- AUTH --------------------------- */

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/login')
    }
}

function otroMiddleware(req, res, next) {
    if(req.session.user === 'admin'){
        next()
    }else {
        res.send('No estas autorizado')
    }
}

/* --------------------- ROUTES --------------------------- */

// REGISTER
app.get('/index', (req, res) =>{
    res.sendFile( __dirname + '/views/register.html')
})


app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html')
})

app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' })
 //async (req, res) =>{
  // const { email, password,direccion } = req.body
  // const newUser = new dataUser ({email, password, direccion})
  // await newUser.save();
  // console.log(newUser.save());
)

app.get('/failregister', (req, res) => {
    res.render('register-error');
})

// LOGIN
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html')
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/datos' }))

app.get('/faillogin', (req, res) => {
    res.render('login-error');
})

app.get('/setAdmin', (req, res) => {
    req.session.user = 'admin';
    res.send('admin setted')
})

app.get('/setNoAdmin', (req, res) => {
    req.session.user = 'hola';
    res.send('Noadmin setted')
})

app.get('/exampleProtected', otroMiddleware, (req, res) => {
    res.send('Esta es la ruta de ejemplo protegida')
})

// DATOS
app.get('/datos', isAuth, (req, res) => {
    if (!req.user.contador) {
        req.user.contador = 0
    }
    req.user.contador++

    res.render('datos', {
        datos: usuarios.find(usuario => usuario.username == req.user.username),
        contador: req.user.contador
    });
})

/* --------- LOGOUT ---------- */
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
})

/* --------- INICIO ---------- */
app.get('/', isAuth, (req, res) => {
    res.redirect('/datos')
})


/*------------MINIMIST----------------*/
        //Require Minimist
const parseArgs = require ('minimist')
//const { infoArgs } =  require('./info');

const info = {
    alias:{
        np: "nombrePlataforma",
        vn: "versionNode",
        rss: "memoriaTotal",
        pe: "pathEjecucion",
        pf: "carpetaProyecto"
    }
}
const commandLinesArg = process.argv.slice(2)
const { np, vn, rss, pe, pf, _ } = parseArgs(commandLinesArg, info);

const infoArgs= { np, vn, rss, pe, pf, _ }
//console.log(infoArgs);

app.get ('/info', (req, res) =>{
    //res.render('info')
    res.send({infoArgs})
})
//iniciado en dependencias "npm run startInfo"


// 

// if (cluster.isMaster){
//     console.log(`Master ${process.pid} is running`)

//     for (let i = 0; i < numCPU; i++){
//         cluster.fork()
//     }
// } else{
//     app.listen(PORT, () =>{
//         console.log(`Worker ${process.pid} started`);
//     })
// }

/* -----------FOREVER-------------- */
// const PORT = parseInt(process.argv[2]) || 8080

// app.get('/forever', (req, res) => {
//     res.send(`Servidor express <span style="color:red;">(forever)</span> en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
// })

// app.listen(PORT, err => {
//     if (!err) console.log(`Servidor express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`)
// })
/* ------------------------- */

/* ------------------------- */
/* --------- LISTEN ---------- */
// const PORT = process.env.PORT
// const server = app.listen(PORT, () => {
//     console.log(`Servidor escuchando en el puerto ${PORT}`)
// })
// server.on("error", error => console.log(`Error en servidor: ${error}`))
