const router = require('express').Router()
const User = require('../models/User')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const schemaRegister = Joi.object({
	name: Joi.string().min(6).max(255).required(),
	email: Joi.string().min(6).max(255).required().email(),
	password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
	email: Joi.string().min(6).max(255).required().email(),
	password: Joi.string().min(6).max(1024).required()
})

router.post('/register', async (req, res) => {
	// constante para validar los campos
	const { error } = schemaRegister.validate(req.body)

	if (error) {
		return res.status(400).json({
			error: error.details[0].message
		})
	}

	// Constante para validar si el correo existe
	const emailExists = await User.findOne({
		email: req.body.email
	})

	if (emailExists) {
		return res.status(400).json({
			error: 'El correo ya esta registrado'
		})
	}

	// Encriptar password
	const salt = await bcrypt.genSalt(10)
	const password = await bcrypt.hash(req.body.password, salt)

	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password
	})
	try {
		const savedUser = await user.save()
		res.json({
			error: null,
			data: savedUser
		})
	} catch (error) {
		res.status(400).json(error)
	}
})

router.post('/login', async (req, res) => {
	const { error } = schemaLogin.validate(req.body)
	if (error) {
		return res.status(400).json({
			error: error.details[0].message
		})
	}

	const user = await User.findOne({
		email: req.body.email
	})
	if (!user) {
		return res.status(400).json({
			error: 'Usuario no existe'
		})
	}
	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword) {
		return res.status(400).json({
			error: 'Password Incorrecto'
		})
	}

	router
	// Creación del Token
	const token = jwt.sign({
		name: user.name,
		id: user._id
	}, process.env.TOKEN_SECRET)

	res.header('auth-token', token).json({
		error: null,
		data: { token }
	})
})

router.get('/list', (req,res) => {
	try{
		const users = User.find()
		res.json({
			error: null,
			data: users
		})
	} catch{
		return res.json.status(500).json(error)
	}
})
router.post('/update', async(req,res) =>{
	let id = req.body._id
	let name = req.body.name
	let email = req.body.email
	try {
		await User.findByIdAndUpdate(id,{
			name,
			email
		}, (err, updated) => {
			if (err) {
				res.status(400).json(err)
			} else {
				res.json({
					error: null,
					message: 'UPDATED'
				})
			}
		},)
	} catch (error) {
		res.status(400).json(error)
	}
})

router.post('/delete', async(req,res) =>{
	let {id} = req.body.id
	try{
		await User.findByIdAndDelete(id)
		res.json({
			error: null,
			message: 'SUCCESS'
		})
	} catch(error) {
		res.status(400).json(error)
	}
})

module.exports = router
