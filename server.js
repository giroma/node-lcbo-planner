const axios = require('axios');
// let products = []
//
// for (var i = 1; i <= 10; i++) {
//   axios.get(`http://lcboapi.com/products?order=price_per_liter_of_alcohol_in_cents.asc&page=${i}&where_not=is_dead,is_discontinued`)
//   .then((response) => {
//     console.log('good');
//     // console.log(response.data.result);
//     products.push(response.data.result)
//   })
//   .catch((error) => {
//     console.log('bad', error);
//   })
// }
//   setTimeout(() => {
//     console.log(products);
//   },1000)



  let promises = [];

  for (var i = 1; i <= 10; i++) {
    let product = axios.get(`http://lcboapi.com/products?order=price_per_liter_of_alcohol_in_cents.asc&page=${i}&where_not=is_dead,is_discontinued&q=belgium+ale+beer`)
    promises.push(product);
  }

  let products = []
  axios.all(promises).then((res) => {
    for (let promise of res) {
      for (var i = 0; i < promise.data.result.length; i++) {

        if (promise.data.result[i].price_per_liter_of_alcohol_in_cents !== 0 && promise.data.result[i].tertiary_category == 'Belgian Strong Ale') {
          console.log(promise.data.result[i].name)
          console.log(promise.data.result[i].package)
          console.log(promise.data.result[i].secondary_category)
          console.log(promise.data.result[i].price_per_liter_of_alcohol_in_cents)
        }
        // (promise.data.result[i].price_per_liter_of_alcohol_in_cents !== 0 && promise.data.result[i].tertiary_category == 'Belgian Strong Ale') ? products.push(promise.data.result[i]) : ''
        // console.log(promise.data.result[i].name)
        // console.log(promise.data.result[i].package)
        // console.log(promise.data.result[i].secondary_category)
        // console.log(promise.data.result[i].price_per_liter_of_alcohol_in_cents)
      }
    }
    // console.log(products);
  })
