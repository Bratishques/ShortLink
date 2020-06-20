const express = require("express")
const config = require("config")
const mongoose = require("mongoose")
const path = require('path')



const app = express()
app.use(express.json({extended: true}))
app.use('/api/auth', require('./Routes/auth.routes'))
app.use("/api/link", require("./Routes/link.router"))
app.use("/t", require("./Routes/redirect.routes"))
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = config.get("port") || 5000

async function start() {
    try {
        await  mongoose.connect(config.get('mongoUri'),{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`shit started ${PORT}`))
    } catch (e) {
        console.log("Server error", e.message)
        process.exit(1)
    }
}

start()



