const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')
const User = require("../model/User")
const Review = require("../model/Review")
const Product = require("../model/Product")
const dayjs = require('dayjs')


// SIGN UP

const handleNewUser = async (req, res) => {
  const { username, password, name, familyName } = req.body;
  if (!username || !password) return res.status(400).json({message: 'Username and password are required'})
  try {
    const duplicate = await User.findOne({ username }).exec();
    if (duplicate) {
      console.log('error')
      return res.status(409).json({message: 'This username exists'})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({
      "id": uuidv4(),
      "username": username,
      "password": hashedPassword,
      "name": name,
      "familyName": familyName,
    });
    res.status(201).json({message: `New user ${username} created.`})
  } 
  catch (err) {
    res.status(500).json({message: 'Server error'})
    console.log('Signing up failed')
  }
}


// LOG IN

const jwt = require('jsonwebtoken')

const handleLogin = async (req, res) => {
  const {username, password} = req.body
  if (!username || !password) return res.status(400).json({message: 'Username and password are required'})
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) return res.status(403).json({message: 'No such user found'})
  const match = await bcrypt.compare(password, foundUser.password)
  if (match) {
    const roles = Object.values(foundUser.roles)
    const address = foundUser.address || ''
    const name = foundUser.name || ''
    const familyName = foundUser.familyName || ''
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "username": foundUser.username,
          "roles": roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    )
    const refreshToken = jwt.sign(
      { "username": foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    )
    foundUser.refreshToken = refreshToken;
    await foundUser.save()
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24*60*60*1000})
    // for thunder client, you might need the comment out the secure: true part
    // for chrome and production, don't forget the include it back
    res.json({ username, roles, accessToken, address, name, familyName })
    console.log(username + ' logged in')
  } else {
    res.status(401).json({message: 'Wrong password'})
  }
}


// REFRESH TOKEN

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.status(401).json({ error: "Unauthorized" })
  const refreshToken = cookies.jwt
  const foundUser = await User.findOne({refreshToken: refreshToken})

  if (!foundUser) return res.sendStatus(403); // forbidden

  const roles = Object.values(foundUser.roles)
  const address = foundUser.address || ''
  const fullName = foundUser.name || ''
  const username = foundUser.username || ''

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || foundUser.username !== decoded.username) return res.sendStatus(403)
      const rolesroles = Object.values(foundUser.roles)
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "username": foundUser.username,
            "roles": roles
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}
      )
      console.log(`New access token for [${username}] sent`)
      res.json({ username, roles, accessToken, address, fullName })
    }
  )
} 


//LOG OUT
  // On client, also delete the accessToken
const handleLogout = async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204)
  const refreshToken = cookies.jwt

  const foundUser = await User.findOne({ refreshToken })

  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    return res.sendStatus(204)
  }

  foundUser.refreshToken = ""
  await foundUser.save()
  res.clearCookie('jwt', { httpOnly: true })  
  // secure: true - only serves on https => for production
  res.status(201).json({message: 'Successfully logged out'})
  console.log(foundUser.username + " has logged out.")
} 

// ORDER

// on the front end, request should be adjusted
const placeOrder = async (req, res) => {
  try {
    const { username } = req.params
    const user = await User.findOne({username})
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newOrdersArray = req.body

    newOrdersArray.forEach((newOrder) => {
      user.orders.push(newOrder)
    })
    await user.save();
    console.log('Order(s) placed')
    return res.status(200).json({message: 'Order(s) placed successfully!'})
  }
  catch (err) {
    return res.status(401).json({message: 'Order couldn\'t be placed'})
  }
}


// PREVIOUS ORDERS

const sendPrevOrders = async (req, res) => {
  const {username} = req.params
  try {
    const foundUser = await User.findOne({ username }).populate('orders')
    if (!foundUser) return res.status(404).json({ message: 'User not found' });
    if (!foundUser.orders) return res.status(404).json({ message: 'No orders found' });
    
    const prevOrders = foundUser.orders || []

    console.log(`Previous orders of [${username}] have been sent.`)
    return res.status(200).json(prevOrders)
  }
  catch (err) {
    console.error('Internal server error')
    return res.status(500).json({message: 'Internal server error'})
  }
}

//SUBMIT REVIEW
const submitRev = async (req, res) => {
  const {id} = req.params
  const {title, comment, stars, user} = req.body

  const uniqueStamp = Date.now()
  const revId = `${uniqueStamp}-${id}-${stars}`
  const date = dayjs().format('D, MMM YYYY')

  const newReview = new Review({
    id: revId, user, date, stars, title, comment
  })

  try {
    await newReview.save()
    const product = await Product.findOne({id}).populate('reviews')
    if (!product) {
      return res.status(404).json({message: "Product not found."})
    }
    product.reviews.push(newReview._id);
    await product.save();
    res.status(200).json({ message: 'Review added successfully.' });
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}


//EDIT PROFILE
const editProfile = async (req, res) => {
  const { username } = req.params
  const updateData = req.body
  try {
    const user = await User.findOne({username})
    if (!user) return res.status(404).json({message: "User not found"})
    await User.updateOne({username}, updateData)
    return res.status(200).json({message: `Account for [${username}] updated`})
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}


module.exports = { handleNewUser, handleLogin, handleRefreshToken, handleLogout, editProfile, placeOrder, submitRev, sendPrevOrders }