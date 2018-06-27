const products = require('./products.json');

let filteredProducts = products.filter((item) => {
  return  item.is_discontinued === false
      &&  item.price_per_liter_of_alcohol_in_cents > 0
      &&  item.price_per_liter_of_alcohol_in_cents < 800
      &&  item.primary_category === 'Wine'
      &&  item.secondary_category === 'Red Wine'
})

filteredProducts.sort((a,b) => {
  return a.price_per_liter_of_alcohol_in_cents - b.price_per_liter_of_alcohol_in_cents
})

filteredProducts.forEach((product) => {
  console.log(product.name);
  console.log(product.price_per_liter_of_alcohol_in_cents);
})
