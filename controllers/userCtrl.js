const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('./sendMail');

const {CLIENT_URL} = process.env

const userCtrl = {
    register: async(req,res) => {
        try{
            const {name, email, password} = req.body;

            if(!name || !email || !password)
            return res.status(400).json({msg: "please fill in all fields."})

            if(!validateEmail(email))
            return res.status(400).json({msg: "Invalid emails."})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg:"This email already exits."})

            if(password.length < 6)
                return res.status(400).json({msg:"Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)
            console.log({password, passwordHash});

            const newUser = {
                name, email, password : passwordHash
            }

            const activation_token = createActivationToken(newUser)

            const url = `${CLIENT_URL}/user/activate/${activation_token}`

            sendMail(email,url)


            res.json({msg:"Register Success! Please activate your email to start."})
        }catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    activateEmail : async (req,res) => {
      try {
        const {activation_token} = req.body
        const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

        const {name, email,password } =user

        const check = await Users.findOne({email})
        if(check) return res.status(400).json({msg:"This email already exists."})

        const newUser = new Users({
          name, email, password
        })
        await newUser.save()

        res.json({msg:"Account has been activated!"})

      } catch (err) {
        return res.status(500).json({msg:err.message})
      }
    }
}

function validateEmail(email) {
    const re =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;;
    return re.test(email);
  }

  const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn:'15m'} )
  }

  const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'15m'} )
  }

  const createRefershToken = (payload) => {
    return jwt.sign(payload, process.env.REFERSH_TOKEN_SECRET, {expiresIn:'7d'} )
  }


module.exports = userCtrl;
