const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

mongoose.connect(process.env.MONGO_URI)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res)=>{
  const {username}= req.body
  try {
    const user= new User({username});
    await user.save();
    res.json({username: user.username, _id: user._id})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

app.get('/api/users', async (req, res)=>{
  try {
    const users = await User.find({}, 'username _id')
    res.json(users)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

app.post('/api/users/:_id/exercises', async (req,res)=>{
  const {description, duration, date} = req.body
  const _id = req.params._id
  try {
    const user = await User.findById(_id);
    if(!user) return res.status(404).json({erreur: 'utilisateur n\'existe pas'})
    const exercises = {
  description,
  duration: Number(duration),
  date: date ? new Date(date).toDateString(): new Date().toDateString()
}
  user.log.push(exercises)
  await user.save();
  res.json({
    _id: user._id,
    username: user.username,
    ...exercises
  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

app.get('/api/users/:_id/logs', async (req, res)=>{
  const _id = req.params._id
  const {from, to, limit} = req.query
  try {
    const user = await User.findById(_id);
    if(!user)return res.status(404).json({error: 'Utilisateur n\'existe pas'})
    let log = user.log
  if(from){
    const fromDate = new Date(from)
    log = log.filter(e=>new Date(e.date)>=fromDate)
  }
  if(to){
    const toDate = new Date(to)
    log = log.filter(e=>new Date(e.date)<=toDate)
  }
  if(limit){
    log = log.slice(0, Number(limit))
  }
    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log.map(({duration, date, description})=>({
        description,
        duration,
        date
      }))
    })
  } catch (error) {
    res.json({error: error.message})
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
