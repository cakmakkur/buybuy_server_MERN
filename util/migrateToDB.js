const migrateItems = async () => {
  try {
    const filePath = path.join(__dirname, 'db', 'products.json')
    const data = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(data);
    await Product.insertMany(products);
    console.log('Products migrated successfully');
  } catch (err) {
    console.error('Error migrating products:', err);
  }
}