
// Describe table

// Require AWS-SDK
const AWS = require('aws-sdk');
// Update AWS Region
AWS.config.update({region: 'us-east-1'});
// Create an instance of dynamoDB
const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

const tableName = "lcbo_products";

var params = {
    TableName: tableName
   };
   ddb.describeTable(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response

   });
