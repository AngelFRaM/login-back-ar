const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const app = express()

var corsOptions = {
	origin: "*", // cuando tengamos el dominio del front debe de ir
	optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
// Capturar el Body
app.use(bodyparser.urlencoded({
	extended: false
}))
app.use(bodyparser.json())


// Conexion a BD
const url = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.twjccj9.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true
}
mongoose.connect(url, options).then(() => {
	console.log('Conectado a la BD')
}).catch(error => {
	console.log('Error db: ', error)
})

// Importar las Rutas
const authRoutes = require('./routes/auth')

// ruta del middleware
app.get('/', (req, res) => {
	res.json({
		estado: true,
		mensaje: 'Works!'
	})
})
app.use('/api/user', authRoutes)

// Arrancar el servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Servidor en: ${PORT}`)
})
