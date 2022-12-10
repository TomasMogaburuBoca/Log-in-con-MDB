const express = require('express');
const app = express();
const session = require('express-session')
const exphbs = require('express-handlebars');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const mongoose = require ('mongoose');
require('dotenv').config();
const {dataUser} = (mongoose);
/*-------------MONGOOSE---------------------*/

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('strictQuery', true);

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

/* --------- LISTEN ---------- */
const PORT = process.env.PORT
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
server.on("error", error => console.log(`Error en servidor: ${error}`))
