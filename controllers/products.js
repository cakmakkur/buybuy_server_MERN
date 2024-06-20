const fs  = require('fs').promises;
const dayjs = require('dayjs')
const path = require('path')
const Product = require('../model/Product')
const Review = require('../model/Review')

const sendSearchResults = async (req, res) => {
  const {query} = req.params
  if (!query) return res.status(400).json({ message: 'Bad query' });
  try {
    const products = await Product.find().populate('reviews')
    const results = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    if (results.length > 0) {
      console.log(`Results for query:[${query}] have been sent`)
      return res.json(results)
    } else {
      return res.status(404).json({message: 'No product found...'})
    }
  }
  catch (err) {
    console.error(`Query search failed: ` + err)
    res.status(500).json({message: 'Internal server error'})
  }
}

const sendFilteredProducts = async (req, res) => {
  const {category} = req.params
  if (!category) return res.status(400).json({ message: 'Bad category' });

  try {
    const products = await Product.find({ category }).populate('reviews')
    if (products && products.length > 0) {
      console.log(`Results for category:[${category}] have been sent`)
      return res.json(products)
    } else {
      return res.status(404).json({message: 'No product found...'})
    }
  }
  catch (err) {
    console.error(`Query search failed: ` + err)
    res.status(500).json({message: 'Internal server error'})
  }
}

const sendIndividualProd = async (req, res) => {
  const {id} = req.params
  try {
    const product = await Product.findOne({ id }).populate('reviews')
    if (!product) return res.status(404).json({message: "Product not found."})
    console.log(`Product id:[${id}] has been sent`)
    res.json(product)
  }
  catch (err) {
    console.error(`Internal server error`)
    res.status(500).json({message: 'Internal server error'})
  }  
}

const sendReviews = async (req, res) => {
  const {id, sect} = req.params
  //sect: 1, 2, 3...
  try {
    const product = await Product.findOne({id}).populate('reviews')
    if (!product) return res.status(404).json({message: "Product not found."})
    if (product.reviews?.length === 0) return res.status(404).json({message: "No review yet."})
    const reviewsSorted = [...product.reviews].reverse()
    const results = reviewsSorted.filter((review, i) => {
      if (!sect && i < 5) {
        return true
      } else if (sect && (Number(sect) - 1) * 5 <= i && i < Number(sect) * 5) {
        return true
      } else {
        return false
      }
    })
    console.log(`Sending reviews for product id:[${id}]`)
    return res.status(200).json(results)
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}

const sendRating = async (req, res) => {
  const { id } = req.params
  try {
    const product = await Product.findOne({id}).populate('reviews')
    if (!product) return res.status(404).json({message: "Product not found."})
    const reviewAmount = product.reviews.length
    if (reviewAmount === 0) return res.status(200).json({message: 'No reviews yet'})
    
    let sum = 0
    product.reviews.forEach(r => sum += r.stars)
    const ratingDetails = { id, average: sum/reviewAmount, reviewAmount }
    console.log(`Sending rating details for id:[${id}]`)
    return res.status(200).json(ratingDetails)
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}

const sendDescription = (req, res) => {
  const {id} = req.params

  //for individual description
  // const filePath = path.join(__dirname, '..', 'db/descriptions', `${id}.html`)

  //for placeholder description:
  const filePathExample = path.join(__dirname, '..', 'db/descriptions', 'b0ee4bcd-0cf3-4a2d-a8b5-73b532b4e92a.html')
  fs.readFile(filePathExample, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the HTML file', err);
      res.status(500).send('Unable to read HTML content');
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
}

const sendImgPaths = async (req, res) => {
  const { type } = req.params
  const dirPath = path.join(__dirname, '..', 'public', type);

  console.log(dirPath)
  try {

    const items = await fs.readdir(dirPath)

    const filePaths = items.map(item => {
      if (item !== ".DS_Store") {
        const itemPath = path.join(type, item)
        return itemPath
      }
    }).filter(Boolean);
    return res.status(200).json(filePaths); 
  }
  catch (err) {
    console.error('Error sending image paths')
    return res.status(500).json({message: "Internal server error"})
  }
}

//come up with a better 'newest' solution
const sendNewest = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length < 1) return res.status(404).json({message: "No new products found."})
    const newProducts = products.slice(0, 6)
    console.log('Sending newest products')
    return res.status(200).json(newProducts)
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}

const sendDeals = async (req, res) => {
  try {
    const discountedProducts = await Product.find({ prevPriceCents: { $ne: null } });
    if (!discountedProducts || discountedProducts.length < 1) return res.status(404).json     ({message: "No deals found."})
    console.log('Sending discounted products')
    return res.status(200).json(discountedProducts)
  }
  catch (err) {
    console.error(`Internal server error: ` + err)
    res.status(500).json({message: 'Internal server error'})  
  }
}

module.exports = {sendFilteredProducts, sendIndividualProd, sendReviews, sendDescription, sendRating, sendSearchResults, sendNewest, sendDeals, sendImgPaths}
