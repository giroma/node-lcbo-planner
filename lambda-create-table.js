// Get stores locations from API and save them to AWS dynamoDB.

// Require AWS-SDK
const AWS = require('aws-sdk');
// Update AWS Region
AWS.config.update({region: 'us-east-1'});
// Create an instance of dynamoDB
const ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

const tableName = "lcbo_stores";


// Delete Table
const deleteTable = () => {
    const params = {
        TableName : tableName
    };

    // Call DynamoDB to delete the table
    ddb.deleteTable(params, function(err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

// Create Table
const createTable = () => {
    // Create dynamoDB object with table Params
    const params = {
        AttributeDefinitions: [
            {
            AttributeName: 'id',
            AttributeType: 'N'
            }
        ],
        KeySchema: [
            {
            AttributeName: 'id',
            KeyType: 'HASH'
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        TableName: tableName,
        StreamSpecification: {
            StreamEnabled: false
        }
        };

        // Call DynamoDB to create the table
        ddb.createTable(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
          }
        });
}

const recreateTable = async () => {
  const deleteTableFn = await deleteTable();
  const createTableFn = await createTable();
  console.log('Success')
}

recreateTable();
