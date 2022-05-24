const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mogoose = require('mongoose')
const { default: mongoose } = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
  name: {type: String, unique: true}
},
{versionKey: false})
const User = mongoose.model('User', userSchema)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST /api/users
app.post('/api/users', (req, res) => {
  const userName = req.body.username
  let user = new User({name: userName})
  user.save((err, data) => {
    if(err) { res.json({error: 'error during save user data'})}
    else {
      res.json(data)
    }
  })
})

//GET /api/users
app.get('/api/users', (req, res) => {
  User.find().exec((err, data) => {
    if(err) { res.json({error: 'error during loading users data'})}
    else {
      res.json(data)
    }
  })
})

//POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  res.json({
    _id : _id,
    description: description,
    duration: duration,
    date: date
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
