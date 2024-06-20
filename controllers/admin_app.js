const { v4: uuidv4 } = require('uuid');
const path = require('path')
const fs  = require('fs').promises
const Product = require('../model/Product')

const addNewProduct = async (req, res) => {
  const {name, category, tn_description, brand, color, priceCents, shippingCostCents} = req.body
  
  if(!name || !category || !priceCents || priceCents <= 0) {
    return res.status(403).json({error: 'Form data error'})
  }

  const maxImagesAllowed = 5;
  if (req.files && req.files.length > maxImagesAllowed) {
    return res.status(400).json({ error: `You can upload no more than ${maxImagesAllowed} images.` });
  }

  let image_paths;
  if (req.files) {
    image_paths = req.files.map(file => `${file.filename}`)
  } else {
    image_paths = []
  }

  try {
    await Product.create({
      id: uuidv4(), name, 'img_path': image_paths, category, tn_description, brand, color, priceCents, shippingCostCents
    })
    console.log(`New product [${name}] added`)
    res.status(200).json({message: `New product [${name}] added`})
  }
  catch (err) {
    console.error('Creating new product failed: ' + err)
    res.status(500).json({ error: 'Server error: creating new product failed.' });
  }
}

const addNewImages = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({id})
  if (!product) return res.status(404).json({message: "Product not found"})

  let new_image_paths = [];

  if (req.files && req.files.length > 0) {
    new_image_paths = req.files.map(file => `${file.filename}`);
  }

  product.img_path = [...product.img_path, ...new_image_paths]
  try {
    await product.save()
    res.status(200).json({ message: 'Image(s) successfully added' });
  }
  catch (err) {
    console.error('Error adding new images: ', err);
    return res.status(500).json({ message: 'Image(s) couldn\'t be added' });
  }
};

const deleteImagePaths = async (req, res) => {
  const { id } = req.params
  const { deletedImgIndexes } = req.body;
  if (!deletedImgIndexes || deletedImgIndexes.length === 0) return res.sendStatus(400)

  try {
    const product = await Product.findOne({id})
    if (!product) return res.sendStatus(404);

    const pathsToDelete = product.img_path.filter((p, i) => deletedImgIndexes.includes(i));
    product.img_path = product.img_path.filter((p, i) => !deletedImgIndexes.includes(i));

    await Promise.all(pathsToDelete.map(async (imgPath) => {
      const fileToDeletePath = path.join(__dirname, '..', 'db', 'product_images', imgPath);
      try {
        await fs.unlink(fileToDeletePath);
      } catch (err) {
        console.error('Error deleting image:', err);
        throw err;
      }
    }));

    await product.save()
    res.status(200).json({ message: 'Image(s) successfully deleted' });
  }
  catch (err) {
    console.error('Error deleting images: ', err);
    return res.status(500).json({ message: 'Image(s) couldn\'t be deleted' });
  }  
}

const updateProduct = async (req, res) => {
  const {id} = req.params
  const updateData = req.body
  const prodToUpdate = await Product.findOne({id})

  if (!prodToUpdate) {
    return res.status(404).json({message: 'Product not found'})
  }

  try {
    await Product.updateOne({id}, updateData)
    console.log(`Product data for id:[${id}] has been updated`)
    return res.json({message: `Product data for id:[${id}] has been updated`})
  }
  catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({message: 'Product data update failed'})
  }
}

const sendProducts = async (req, res) => {
  const products = await Product.find()
  res.json(products)
  console.log('Product data has been sent')
}

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Product.deleteOne({id})

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log(`Product id:[${id}] has been deleted`)
    return res.json({message: `Product id:[${id}] has been deleted`})  
  }
  catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({message: 'Deleting product failed'})
  }
};


module.exports = {addNewProduct, updateProduct, sendProducts, addNewImages, deleteImagePaths, deleteProduct}