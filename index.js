const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mogoose = require('mongoose')
const { default: mongoose } = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
  username: {type: String, unique: true}
},
{versionKey: false})
const User = mongoose.model('User', userSchema)

const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: Date,
  user_id: String
},
{versionKey: false});
const Exercise = mongoose.model('Exercise', exerciseSchema)

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.use((req, res, next) =>{
  console.log(req.originalUrl)
  next()
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST /api/users
app.post('/api/users', (req, res) => {
  const userName = req.body.username
  let user = new User({username: userName})
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

  let exercise = new Exercise({
    user_id: _id,
    description: description,
    duration: duration,
    date: new Date(date).toDateString()
  })

  User.findById(_id, (err, userData) => {
    if(err) {res.json({error: `can't find user _id:${_id}`})}
    else{
      exercise.save((err, exerciseData) => {
        if(err) {res.json({error: 'error during saving exercise'})}
        else {
          res.json({
            _id: userData._id,
            username: userData.username,
            date: new Date(exerciseData.date).toDateString(),
            duration: exerciseData.duration,
            description: exerciseData.description
          });
          //{"_id":"628d3eaa7a0fcc06ac75b076","username":"asaSss22","date":"Mon Dec 12 2022","duration":12,"description":"wwww"}
        }
      })
    }
  })
})

//GET  /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id
  User.findById(_id, (err, userData) => {
    if(err) {res.json({error: `can't find user _id:${_id}`})}
    else{
      Exercise.find({user_id: _id}, '-_id description duration date').exec((err, data) => {
        if(err) {res.json({error: 'error during loading users exercise logs'})}
        else{
          data.forEach((element, index) => {
            data[index] = {
              description: element.description,
              duration: element.duration,
              date: new Date(element.date).toDateString()
            }
          });

          let resobj = {
            username: userData.username,
            count: data.length,
            _id: userData._id,
            log: data
          }

          res.json(resobj)
        }
      })
    }
  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
