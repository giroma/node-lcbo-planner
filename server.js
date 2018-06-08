const axios = require('axios');

axios.get('http://lcboapi.com/stores')
  .then((response) => {
    console.log('good');
    console.log(response.data);
  })
  .catch((error) => {
    console.log('bad');
  })
