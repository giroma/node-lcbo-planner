// Get stores locations from API and save them to AWS dynamoDB.

// Require AWS-SDK
const AWS = require('aws-sdk');
// Update AWS Region
AWS.config.update({region: 'us-east-1'});
// Create an instance of dynamoDB
const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

// Require Axios Module
const axios = require('axios');
const fs = require('fs');

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

const writeToFile = (params,i) => {
  fs.readFile('./products.json', (err, data) => {
    let mydata = JSON.parse(data);
    // console.log('mydata', mydata[0])
    // console.log('params[0]', params)
    params.forEach(item => {
      mydata.push(item)
    })
    // mydata.push(params);
    mydata = JSON.stringify(mydata, null, "\t")
  fs.writeFile('products.json', mydata, (err, data) => {
      if(err) {
        console.log('writefile error',err);
      } else {
        console.log(`json page ${i} written successfully`);
      }
    })
  }
  );
}

// Loop through all pages to build Objects
const loopProductsPages = async (pages) => {
  // fs.writeFile('products.json', '[]', () => {console.log('file created')});
  for (let i = 385; i <= pages; i++) {
    let getProductsDataFn = await getProductsData(i);
    // let buildDynamoObjectFn = await buildDynamoObject(getProductsDataFn);
    await writeToFile(getProductsDataFn,i);
    }
}

const getProducts = async () => {
  let pagesTotal = await getPagesNumber();
  let loopProductsPagesFn = await loopProductsPages(pagesTotal);
}

getProducts()
