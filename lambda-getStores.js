// Get stores locations from API and save them to AWS dynamoDB.

// Require AWS-SDK
const AWS = require('aws-sdk');
// Update AWS Region
AWS.config.update({region: 'us-east-1'});
// Create an instance of dynamoDB
const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

// Require Axios Module
const axios = require('axios');

// Get Pages number from API Stores endpoint to know all stores and pages.
const getPagesNumber = async () => {
  let url = `http://lcboapi.com/stores?per_page=20&page=1`
  return await axios.get(url)
    .then(res => {
      return res.data.pager.total_pages
    })
}

// Get Stores data
const getStoresData = async (page) => {
  let url = `http://lcboapi.com/stores?per_page=20&page=${page}`
  return await axios.get(url)
    .then(res => {
      if(res.status === 200) {
        return res.data.result
      } else {
        throw new Error('There was a problem reaching the API Server');
      }
    })
    .catch((err) => console.log(err))
}

// Build dynamoDB object
const buildDynamoObject = async (data) => {
  // Create empty array to push objects once mapped
  let itemsArr = [];
  // Default DynamoDB object
  let params = {
    RequestItems: {
      "lcbo_stores": itemsArr
    }
  }
  // Map trhough data to build dynamoDB object
  data.map(item => {
    itemsArr.push(
      {
        PutRequest: {
          Item: {
            'id' : {N: `${item.id}`},
            'is_dead' : {BOOL: item.is_dead},
            'name' : {S: `${item.name}`},
            'tags' : {S: `${item.tags}`},
            'address_line_1' : {S: `${item.address_line_1}`},
            'address_line_2' : {S: `${item.address_line_2}`},
            'city' : {S: `${item.city}`},
            'postal_code' : {S: `${item.postal_code}`},
            'telephone' : {S: `${item.telephone}`},
            'fax' : {S: `${item.fax}`},
            'latitude' : {S: `${item.latitude}`},
            'longitude' : {S: `${item.longitude}`},
            'products_count' : {S: `${item.products_count}`},
            'inventory_count' : {S: `${item.inventory_count}`},
            'inventory_price_in_cents' : {S: `${item.inventory_price_in_cents}`},
            'inventory_volume_in_milliliters' : {S: `${item.inventory_volume_in_milliliters}`},
            'has_wheelchair_accessability' : {BOOL: item.has_wheelchair_accessability},
            'has_bilingual_services' : {BOOL: item.has_bilingual_services},
            'has_product_consultant' : {BOOL: item.has_product_consultant},
            'has_tasting_bar' : {BOOL: item.has_tasting_bar},
            'has_beer_cold_room' : {BOOL: item.has_beer_cold_room},
            'has_special_occasion_permits' : {BOOL: item.has_special_occasion_permits},
            'has_vintages_corner' : {BOOL: item.has_vintages_corner},
            'has_parking' : {BOOL: item.has_parking},
            'has_transit_access' : {BOOL: item.has_transit_access},
            'sunday_open' : {S: `${item.sunday_open}`},
            'sunday_close' : {S: `${item.sunday_close}`},
            'monday_open' : {S: `${item.monday_open}`},
            'monday_close' : {S: `${item.monday_close}`},
            'tuesday_open' : {S: `${item.tuesday_open}`},
            'tuesday_close' : {S: `${item.tuesday_close}`},
            'wednesday_open' : {S: `${item.wednesday_open}`},
            'wednesday_close' : {S: `${item.wednesday_close}`},
            'thursday_open' : {S: `${item.thursday_open}`},
            'thursday_close' : {S: `${item.thursday_close}`},
            'friday_open' : {S: `${item.friday_open}`},
            'friday_close' : {S: `${item.friday_close}`},
            'saturday_open' : {S: `${item.saturday_open}`},
            'saturday_close' : {S: `${item.saturday_close}`},
            'updated_at' : {S: `${item.updated_at}`},
            'store_no' : {S: `${item.store_no}`}
          }
        }
      }
      );
    });
    return params;
}

// Write to dynamoDB
let count =0;
const writeToDynamo = async (params) => {
  let batchWrite = await ddb.batchWriteItem(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else  {
      // console.log('success', data); // successful response
      // Exponentially raise the backoff time
      let itemsLost = data.UnprocessedItems;
      if (itemsLost.constructor === Object && Object.keys(itemsLost).length === 0) {
        console.log("Everything made it - hurray!");
      } else {
        console.log("Re-sending missed items");
        // Exponentially raise the backoff time
        count++;
        setTimeout(function(){
          let params = {};
          params.RequestItems = itemsLost;
          dynamoDB.batchWriteItem(params, writeToDynamo);
        }, 1000 * count);

      }
    }
    return 'done';
  });
}

// Loop through all pages to build Objects
const loopStoresPages = async (pages) => {
  for (let i = 1; i <= pages; i++) {
    let getStoresDataFn = await getStoresData(i);
    let buildDynamoObjectFn = await buildDynamoObject(getStoresDataFn);
    let writeToDynamoFn = await writeToDynamo(buildDynamoObjectFn);
    }
}

const getStores = async () => {
  let pagesTotal = await getPagesNumber();
  let loopStoresPagesFn = await loopStoresPages(pagesTotal);
  console.log('loopStoresPagesFn', loopStoresPagesFn);
  console.log('success')
}

getStores()
