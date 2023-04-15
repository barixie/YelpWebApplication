const express = require('express');
const app = express();
// var request = require("request");
const axios = require('axios');
const util = require('util');
const cors = require('cors')

//search business results
// req : from,Location,categories,term,radius,
app.get('/search', (req, res) => {
  console.log("req.query:")
  console.log(req.query)
  if(req.query.auto_check == 'true'){
    search_business(req);
  }
  else{
    var location = req.query.Location
    var googleGeoApi_base_url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyC_aTIZfujA0jZUlwJ5R0wFVBCGO5vTzMo&address="
    googleGeoApi_base_url += location.replaceAll(' ','+').replaceAll(',','')
    console.log(googleGeoApi_base_url)
    axios.get(googleGeoApi_base_url)
            .then(geo_data => {
              var geo_error = geo_data.data["status"]
              if(geo_error !== "OK"){
                  console.log('no geo data info')
              }
              else{
                  var lat = geo_data.data["results"][0]["geometry"]["location"]["lat"]
                  var lng = geo_data.data["results"][0]["geometry"]["location"]["lng"]
                  console.log(geo_error)
                  console.log("geo:", lat, lng)
                  req.query.latitude = lat
                  req.query.longitude = lng
                  search_business(req)
              }
          })
  }

  function search_business(req){
    api_key = "O2MyQbMzSni-QlKepm3rt-Y-XFWrEQ8CHVrcQjT0UiaFhNFpCK47CLGl1jfmQoINaFmYiVS6Mb5wTINfXH_nRLWRzGd1qdNUaeC3PQyIvsN5rTbGKUudWSffYjspY3Yx"
    Yelp_base_url = "https://api.yelp.com/v3/businesses/search?"
    //Yelp_base_url_test = "https://api.yelp.com/v3/businesses/search?term=Pizza&latitude=34.052235&longitude=-118.243683&categories=Food&radius=16093"
    //extract search args from user input
    latitude = req.query.latitude
    longitude = req.query.longitude
    radius = req.query.radius
    term = req.query.term
    categories = req.query.categories
    //add to Yelp_base_url
    Yelp_base_url += "term=" + term
    Yelp_base_url += "&latitude=" + latitude
    Yelp_base_url += "&longitude=" + longitude
    Yelp_base_url += "&categories=" + categories
    Yelp_base_url += "&radius=" + radius
    console.log(Yelp_base_url)
    axios.get(Yelp_base_url, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
      }
    })
    .then(response => {
      //console.log(response.data)
      res.header("Access-Control-Allow-Origin","*")
      res.send(JSON.stringify(response.data))
    })
    .catch(error => {
      console.log(error)
    })
}
});

//req : keyword
app.get('/autoComplete', (req, res) => {
  api_key = "O2MyQbMzSni-QlKepm3rt-Y-XFWrEQ8CHVrcQjT0UiaFhNFpCK47CLGl1jfmQoINaFmYiVS6Mb5wTINfXH_nRLWRzGd1qdNUaeC3PQyIvsN5rTbGKUudWSffYjspY3Yx"
  AutoComplete_base_url = "https://api.yelp.com/v3/autocomplete?text="
  AutoComplete_base_url += req.query.keyword
  axios.get(AutoComplete_base_url, {
    headers: {
      'Authorization': `Bearer ${api_key}`,
    }
  })
  .then(response => {
    res.header("Access-Control-Allow-Origin","*")
    res.send(JSON.stringify(response.data))
  })
  .catch(error => {
    console.log(error)
  })

});

// req : id
app.get('/search/detail', (req,res) => {
  api_key = "O2MyQbMzSni-QlKepm3rt-Y-XFWrEQ8CHVrcQjT0UiaFhNFpCK47CLGl1jfmQoINaFmYiVS6Mb5wTINfXH_nRLWRzGd1qdNUaeC3PQyIvsN5rTbGKUudWSffYjspY3Yx"
  Yelp_detail_base_url = "https://api.yelp.com/v3/businesses/"
  Yelp_detail_base_url += req.query.id
  axios.get(Yelp_detail_base_url, {
    headers: {
      'Authorization': `Bearer ${api_key}`,
    }
  })
  .then(
    response => {
      res.header("Access-Control-Allow-Origin","*")
      res.send(JSON.stringify(response.data))
    })
  .catch(error => {
    console.log(error)
  })
});

// req : id
app.get('/search/review', (req,res) => {
  api_key = "O2MyQbMzSni-QlKepm3rt-Y-XFWrEQ8CHVrcQjT0UiaFhNFpCK47CLGl1jfmQoINaFmYiVS6Mb5wTINfXH_nRLWRzGd1qdNUaeC3PQyIvsN5rTbGKUudWSffYjspY3Yx"
  Yelp_detail_base_url = "https://api.yelp.com/v3/businesses/"
  Yelp_detail_base_url += req.query.id
  Yelp_detail_base_url += "/reviews"
  axios.get(Yelp_detail_base_url, {
    headers: {
      'Authorization': `Bearer ${api_key}`,
    }
  })
  .then(
    response => {
      res.header("Access-Control-Allow-Origin","*")
      res.send(JSON.stringify(response.data))
    })
  .catch(error => {
    console.log(error)
  })
});


const PORT =  8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
// [END gae_node_request_example]

module.exports = app;