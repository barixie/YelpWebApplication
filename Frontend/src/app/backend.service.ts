import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { table } from './table';
import { detail } from './detail'
import { review } from './review';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BackendService {

  Business_info : table [] = [];

  Detail : detail[] = [];

  Review_data : review[] = [];

  count : number = 0;

  HOST = 'https://yelp-search-angular-1007.wl.r.appspot.com';
  // HOST = 'http://localhost:8080';

  public search_business = this.HOST + '/search?';

  constructor(private http: HttpClient) { }

  async RequestBackendSearch({ term, distance, location, autocheck, categories,latitude,longitude }: { term: string; distance: number; location: string; autocheck: boolean; categories: string;latitude:number;longitude:number }){
    return new Promise((resolve) => {
      
    this.Business_info = [];
    var search_business = this.HOST + '/search?';
    if(categories == ''){
      var categorySearch = "All"
    }else{
      categorySearch = categories
    }

    if(distance == 0){
     var distanceSearch = 10
    }
    else{
      distanceSearch = distance*1609
    }
    search_business += "term=" + term;
    search_business += "&radius=" + String(distanceSearch);
    search_business += "&categories=" + categorySearch;
    search_business += "&auto_check=" + String(autocheck);
    search_business += "&Location=" + location;
    search_business += "&longitude=" + longitude;
    search_business += "&latitude=" + latitude;
    console.log("search_business_url: " + search_business)
    fetch(search_business)
    .then(response => response.json())
    .then(response => {
      //console.log("business: ", response.businesses)
      var business_list = response.businesses;
      var len = 0;
      if(business_list.length > 10){
        len = 10;
      }else{
        len = business_list.length;
      }
      for(var i=0;i<len;i++){
        let new_table = <table>{};

          //id
          var id;
          if(business_list[i].hasOwnProperty("id") && business_list[i]['id'].length > 0){
            id = business_list[i]['id'];
          }
          new_table.id = id;
          //id number
          var number = i + 1
          new_table.num = number;
          //image
          var image_url = ''
          if(business_list[i].hasOwnProperty("image_url") && business_list[i]["image_url"].length > 0){
              image_url = business_list[i]["image_url"]
          }
          new_table.imageURL = image_url;
          //Business Name
          var business_name = ''
          if(business_list[i].hasOwnProperty("name")){
              business_name = business_list[i]['name']
          }
          new_table.name = business_name;
          //Rating
          var rating = ''
          if(business_list[i].hasOwnProperty("rating")){
              rating = business_list[i]['rating']
          }
          new_table.rating = Number(rating);
          //distance
          var distance = ''
          if(business_list[i].hasOwnProperty("distance")){
              distance = business_list[i]['distance']
              distance = (Number(distance)/1609.344).toFixed(2)
          }
          new_table.distance = Number(distance);

          var latitude = 0
          var longitude = 0
          if(business_list[i].hasOwnProperty("coordinates")){
              latitude = business_list[i]['coordinates']['latitude']
              longitude = business_list[i]['coordinates']['longitude']
          }
          new_table.latitude = latitude;
          new_table.longitude = longitude;
          //console.log(new_table);
          this.Business_info.push(new_table);

      }
      //console.log(this.Business_info);
      resolve("finished");
      return this.Business_info;
    })
  });
}


  RequestBackendAutoComplete(keyword:string){
    var autoComplete_url = this.HOST + '/autocomplete?keyword=';
    var autoComplete_list : any[] = [];
    autoComplete_url += keyword;
    fetch(autoComplete_url)
    .then(response => response.json())
    .then(response => {
      var term_sug_list = response.terms;
      var category_sug_list = response.categories;
      for(var i=0;i<category_sug_list.length;i++){
        autoComplete_list.push(category_sug_list[i]['title']);
      }
      for(var i=0;i<term_sug_list.length;i++){
        autoComplete_list.push(term_sug_list[i]['text']);
      }
    })
    const obsof1=of(autoComplete_list);
    return obsof1;
  }

  async RequestBackendDetail(id:string){
    return new Promise((resolve) =>{
    this.Detail = [];
    var detail_url = this.HOST + '/search/detail?id=';
    detail_url += id;
    fetch(detail_url)
    .then(response => response.json())
    .then(detail_data => {
      let result = <detail>{};
      // name
      var name = ''
          if(detail_data.hasOwnProperty('name')){
              name = detail_data['name']
          }
      result.name = name;

      //status
      var status = false;
      if(detail_data.hasOwnProperty('hours')){
          status = detail_data['hours'][0]['is_open_now']
          if(typeof status === 'boolean'){
            result.status = status;
          }
      }

      //category
      var category = ''
        if(detail_data.hasOwnProperty("categories")){
            var category_array = detail_data['categories']
            if(category_array.length > 0){
                for(var i=0; i<category_array.length;i++){
                    category += category_array[i]['title'] + '|';
                }
                category = category.slice(0,-1);
                result.category = category;
            }
        }
      //address
      var address = ''
      if(detail_data.hasOwnProperty('location')){
          var address_array = detail_data['location']['display_address']
          if(address_array.length > 0){
              for(var i=0; i<address_array.length; i++){
                  address += address_array[i]
                  address += ' '
              }
              result.address = address;
          }
      }

      //Phone 
      var phone_number = ''
      if(detail_data.hasOwnProperty('display_phone')){
          phone_number = detail_data['display_phone']
          if(phone_number !== ''){
            result.phone_number = phone_number;
          }
      }

      //transaction supported
      var transaction = ''
      if(detail_data.hasOwnProperty('transactions')){
          var transaction_array = detail_data['transactions']
          if(transaction_array.length > 0){
              for(var i=0; i< transaction_array.length; i++){
                  transaction += transaction_array[i] +'|'
              }
              transaction = transaction.slice(0,-1);
              result.transaction_supported = transaction;
          }
      }

      //price
      var price = ''
      if(detail_data.hasOwnProperty('price')){
          price = detail_data['price']
          if(price !== ''){
            result.price = price;
          }
      }

      //info
      var info = ''
      if(detail_data.hasOwnProperty('url')){
          info = detail_data['url']
          if(info !== ''){
              result.info = info;
          }
      }
      //photo
      if(detail_data.hasOwnProperty('photos')){
        var photourl_list = detail_data['photos']
        if(photourl_list.length > 0){
          result.photo_list = photourl_list;
        }
    }
    this.Detail.push(result);
    //console.log(this.Detail);
    resolve("finished");
    return this.Detail;
    })
  });
  }

  async RequestBackendReview(id:string){
    return new Promise((resolve) =>{
    this.Review_data = [];
    var review_url = this.HOST + '/search/review?id=';
    review_url += id;
    fetch(review_url)
    .then(response => response.json())
    .then(review_data => {
      var data_list = review_data['reviews'];
      //console.log(data_list);
      for(var i=0;i< data_list.length;i++){
        let result = <review>{};
        //rating
        var rating = 0;
        if(data_list[i].hasOwnProperty('rating')){
          rating = data_list[i]['rating'];
        }
        result.rating = rating;

        //name
        var name = '';
        if(data_list[i].hasOwnProperty('user')){
          name = data_list[i]['user']['name'];
          if(name != ''){
            result.user_name = name;
          }
        }

        //text
        var text = '';
        if(data_list[i].hasOwnProperty('text')){
          text = data_list[i]['text'];
        }
        result.text = text;

        //time
        var time = '';
        if(data_list[i].hasOwnProperty('time_created')){
          time = data_list[i]['time_created'];
        }
        result.time_created = time;

        this.Review_data.push(result);

      }
      resolve("finished");
    });
  });
  }

  getBusinessInfo() {
    return this.Business_info;
  }

  getDetail(){
    return this.Detail;
  }

  getReview(){
    return this.Review_data;
  }

  
}
