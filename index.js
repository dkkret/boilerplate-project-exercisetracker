const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mogoose = require('mongoose')
const { default: mongoose } = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
  username: {type: String, required: true}
},
{versionKey: false})
const User = mongoose.model('User', userSchema)

const exerciseSchema = new Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
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
    if(err) {console.log('error during save user data'); res.json({error: 'error during save user data'})}
    else {
      console.log(data)
      res.json(data)
    }
  })
})

//GET /api/users
app.get('/api/users', (req, res) => {
  User.find().exec((err, data) => {
    if(err) {console.log('error create user'); res.json({error: 'error during loading users data'})}
    else {
      //console.log(data)
      res.json(data)
    }
  })
})

//POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id
  const description = String(req.body.description)
  const duration = Number(req.body.duration)
  const date2 = String(req.body.date).toString()

  let dd;
  if(date2 === "" || date2 === 'undefined') {
    dd = new Date()
  }
  else {
    dd = new Date(date2.toString())
  }

  let exercise = new Exercise({
    user_id: _id,
    description: description,
    duration: duration,
    date: (date2 === "" || date2 === 'undefined') ? new Date() : new Date(date2.toString())
  })

  console.log('-----BeginInputExercse')
  console.log(date2)
  console.log(exercise.date)
  console.log(req.body)
  console.log(req.params)
  console.log(_id)
  console.log('-----EndnputExercise')

  User.findById(_id, (err, userData) => {
    if(err) {console.log(`#7can't find user _id:${_id}`); res.json({error: `can't find user _id:${_id}`})}
    else{
      exercise.save((err, exerciseData) => {
        if(err) {console.log('error during saving exercise');console.log(err); res.json({error: 'error during saving exercise'})}
        else {
          
          const respObj = {
            _id: userData._id,
            username: userData.username,
            date: new Date(exerciseData.date).toDateString(),
            duration: exerciseData.duration,
            description: exerciseData.description
          }
          console.log()
          res.json(respObj);
          //{"_id":"628d3eaa7a0fcc06ac75b076","username":"asaSss22","date":"Mon Dec 12 2022","duration":12,"description":"wwww"}
        }
      })
    }
  })
})

//GET  /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id
  const limit = req.query.limit
  const from = req.query.from
  const to = req.query.to
  User.findById(_id, (err, userData) => {
    if(err) {console.log(`#1${_id}`);res.json({error: `can't find user _id:${_id}`})}
    else{
    //   db.posts.find({ //query today up to tonight
    //     created_on: {
    //         $gte: new Date(2012, 7, 14), 
    //         $lt: new Date(2012, 7, 15)
    //     }
    // })

    let pred = {user_id: _id};
    if(from !== undefined)
    {
      pred.date = {$gte: new Date(from).toDateString()}
    }
    if(to !== undefined)
    {
      pred.date = {$lte: new Date(to).toDateString()}
    }
    if(from !== undefined && to !== undefined) {
      pred.date = {$gte: new Date(from).toDateString(), $lte: new Date(to).toDateString()}
    }

      Exercise.find(pred, '-_id description duration date').limit(limit).exec((err, data) => {
        if(err) {console.log(`#2${_id}`);res.json({error: 'error during loading users exercise logs'})}
        else{
          data.forEach((element, index) => {
            data[index] = {
              description: String(element.description),
              duration: Number(element.duration),
              date: new Date(element.date).toDateString()
            }
          });

          let resobj = {
            _id: String(userData._id),
            username: String(userData.username),
            count: Number(data.length),
            
            log: data
          }
          console.log('--params')
          console.log(limit)
          console.log(from)
          console.log(to)
          console.log(pred)
          console.log('--params')
          console.log(resobj)
          res.json(resobj)
        }
      })
    }
  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
