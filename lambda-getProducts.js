// Get stores locations from API and save them to AWS dynamoDB.

// Require AWS-SDK
const AWS = require('aws-sdk');
// Update AWS Region
AWS.config.update({region: 'us-east-1'});
// Create an instance of dynamoDB
const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

// Require Axios Module
const axios = require('axios');

// Get Pages number from API Products endpoint to know all stores and pages.
const getPagesNumber = async () => {
  let url = `http://lcboapi.com/products?per_page=20&page=1`
  return await axios.get(url)
    .then(res => {
      console.log('pages', res.data.pager.total_pages);
      return res.data.pager.total_pages
    })
}

// Get Products data
const getProductsData = async (page) => {
  let url = `http://lcboapi.com/products?page=${page}`
  return await axios.get(url)
    .then(res => {
      if(res.status === 200) {
        return res.data.result
      } else {
        throw new Error('There was a problem reaching the API Server');
      }
    })
    .catch((err) => console.log('catch axios error',err))
}
const createAWShash = (productHash) => {
  const keysArray = Object.keys(productHash)
  let hashAWS = {}

  for (key of keysArray) {
    let type = typeof productHash[key]


    let typeAWS = 'S'
    switch (type) {
      case 'object':
      typeAWS = 'S'
      break;
      case 'boolean':
      typeAWS = 'BOOL'

      break;
      case 'number':
      typeAWS = 'N'
      break;
      case 'string':
      typeAWS = 'S'
      break;
    }

    let value = {}
    value[typeAWS] = `${productHash[key]}`

    if (type === 'boolean') {
      value[typeAWS] = productHash[key]
    }

    hashAWS[key] = value
  }
  return hashAWS
}
// Build dynamoDB object
const buildDynamoObject = async (data) => {
  // Create empty array to push objects once mapped
  let itemsArr = [];
  // Default DynamoDB object
  let params = {
    RequestItems: {
      "lcbo_products": itemsArr
    }
  }
  // Map trhough data to build dynamoDB object
  data.map(item => {
    itemsArr.push(
      {
        PutRequest: {
          Item: createAWShash(item)
        }
      }
      );
    });
  return params;
}

// Write to dynamoDB
const writeToDynamo = (params) => {
  let count = 1;
  ddb.batchWriteItem(params, function(err, data) {
    if (err) console.log('batch error',params.lcbo_products, err, err.stack); // an error occurred
    else  {
      // console.log('success', data); // successful response
      // Exponentially raise the backoff time
      let itemsLost = data.UnprocessedItems;
      if (itemsLost.constructor === Object && Object.keys(itemsLost).length === 0) {
        console.log("Everything made it - hurray!");
      } else {
        console.log("Re-sending missed items");
        count++;
        setTimeout(function(){
          let params = {};
          params.RequestItems = itemsLost;
          ddb.batchWriteItem(params, writeToDynamo);
        }, (1000 * count));

      }
    }
    return 'done';
  });
}

// Loop through all pages to build Objects
const loopProductsPages = async (pages) => {
  for (let i = 1; i <= pages; i++) {
    let getProductsDataFn = await getProductsData(i);
    let buildDynamoObjectFn = await buildDynamoObject(getProductsDataFn);
    await writeToDynamo(buildDynamoObjectFn);
    }
}

const getProducts = async () => {
  let pagesTotal = await getPagesNumber();
  let loopProductsPagesFn = await loopProductsPages(pagesTotal);
  console.log('loopProductsPagesFn', loopProductsPagesFn);
  console.log('success')
}

getProducts()
