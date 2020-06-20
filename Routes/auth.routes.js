const {Router} = require("express")
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = Router()
const User = require('../models/User')
const config = require("config")

router.post("/register",
    [
      check("email","incorrect email").isEmail(),
        check("password", "Minimal dlina").isLength({min:8})
    ],
    async  (req, res) => {
    try {
        console.log(req.body)
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "данные хуйня"
            })
        }
        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if (candidate) {
            return res.status(400).json({message: "Уже существует"})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = new User({email: email, password: hashedPassword})

        await user.save()
        res.status(201).json({message: "создано"})
    }
    catch (e) {
        res.status(500).json({message: "ПОПРОБУЙ СНОВА"})
    }
})

router.post("/login",
    [
        check("email","incorrect email").normalizeEmail().isEmail(),
        check("password", "Minimal dlina").exists()
    ],
    async  (req, res) => {
            try {
                const errors = validationResult(req)

                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        errors: errors.array(),
                        message: "данные хуйня"
                    })
                }
                const {email, password} = req.body
                const user = await User.findOne({email})
                if (!user) {
                    return res.status(400).json({message: "не найден пользователь"})
                }

                const isMatch = bcrypt.compare(password, user.password)

                if (!isMatch) {
                    return res.status(400).json({message:"пароль не найден"})
                }

                const token = jwt.sign(
                    {userId: user.id},
                    config.get('jwtSecret'),
                    {expiresIn: "1h"}
                )

                res.json({token, userId: user.id})

            }
            catch (e) {
                res.status(500).json({message: "ПОПРОБУЙ СНОВА"})
            }

})

module.exports = router