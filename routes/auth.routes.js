const login = require('../controlers/auth.controler');
const {Router} = require('express')
const router = Router()
router.post('/login', login )
module.exports = router