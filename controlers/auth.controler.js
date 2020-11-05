const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
module.exports = (req, res)=>{
  
  User.findOne({where:{login: req.body.login}}).then((user)=>{
    if(user) {
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      if(passwordIsValid) {
        const token = jwt.sign({
          login:user.login,
          id:user.id
        }, 'ss',{expiresIn:1000*60})
        let resBody
        if(user.id == "1"){
           resBody = {token, user, is_admin: 1}
        }
         else{
          resBody =  {token, user};
        }
        res.json(resBody)
      }else {
        res.status(401).json({message:"ПАроль"})
      }
    }
    else {
      res.status(404).json({message:"Поль не най"})
    }
  })

}