import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BackendService } from '../backend.service';
import { detail } from '../detail';
import { table } from '../table';
import { tableHead, tablehead } from '../tableHead';
import { ViewportScroller } from "@angular/common";
import { review } from '../review';
import { NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReservationComponent } from '../reservation/reservation.component';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  [x: string]: any;

  BusinessLink = '';
  BusinessName = '';
  TwitterURL = '';
  FaceBookURL='';
  minLengthTerm = 2;

  isLoading = false;

  filtered_keyword! : any[];


  constructor(
    private formBuilder: FormBuilder,
    private backendService: BackendService,
    private scroller: ViewportScroller,
    private transModalService: NgbModal
    ) {
     }

  lattitude = 0;

  longitutde = 0;

  Business_table : table[] = [];

  Review_list : review[] = [];

  TableHead : tableHead[] = [];

  NoRecord : string = '';

  autoComplete_list : string[] = [];

  Detail:detail[]=[];

  detail_id: string = '';

  detail_list : detail[] = [];

  filtered_detail : {title:string,value:string}[] = [];

  photo : string[] = [];

  Reserve_flag : boolean = false;

  flag_detail : Boolean=false;

  latitude : number = 34.052235

  longitude : number = -118.243683

  isDisabled = false;

  mapOptions: google.maps.MapOptions = {
    center: { lat: this.latitude, lng: this.longitude },
    zoom : 14
  }
  marker = {
    position: { lat: this.latitude, lng: this.longitude },
  }

  checkoutForm = this.formBuilder.group({
    keyword: '',
    location: {value: '', disabled: this.isDisabled},
    distance:'',
    category:'',
    auto_check:''
  });

  onClick() {
    this.flag_detail = false;
    this.Reserve_flag = false;
  }

  OnChange() {
    if(this.checkoutForm.value.auto_check){
      this.checkoutForm.get('location')?.disable();
      this.checkoutForm.get('location')?.reset();
      var geo_url = "https://ipinfo.io/?token=fdb66135f152ea"
      fetch(geo_url)
          .then(response => response.json())
          .then(geo =>{
              var location = geo["loc"]
              var location_lat = location.substring(0, location.indexOf(','))
              var location_log = location.substring(location.indexOf(',') + 1, location.length)
              this.latitude = location_lat;
              this.longitude = location_log;
          })
    }
    else{
      this.checkoutForm.get('location')?.enable();
    }
  }

  async onSubmit(){
    
    //this.filtered_keyword = this.backendService.RequestBackendAutoComplete(String(this.checkoutForm.value.keyword));

    this.TableHead = [];
    this.NoRecord = '';
    var keyword = String(this.checkoutForm.value.keyword);
    var distance = Number(this.checkoutForm.value.distance);
    var categories = String(this.checkoutForm.value.category);
    var auto_check = Boolean(this.checkoutForm.value.auto_check);
    var location = String(this.checkoutForm.value.location);
    var lat = Number(this.latitude);
    var lng = Number(this.longitude);
    if(distance > 25){
      window.alert('Distance too large, should be less than 25 miles');
    }
    if(!auto_check){
      var googleGeoApi_base_url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyC_aTIZfujA0jZUlwJ5R0wFVBCGO5vTzMo&address="
      googleGeoApi_base_url += location
      console.log(googleGeoApi_base_url)
      fetch(googleGeoApi_base_url)
      .then(response => response.json())
            .then(geo_data => {
                var geo_error = geo_data["status"]
                if(geo_error != "OK"){
                    window.alert("invalid address");
                }
            })
    }
    await this.backendService.RequestBackendSearch({ term: keyword, distance, location, autocheck: auto_check, categories,latitude:lat,longitude:lng });
    this.Business_table = this.backendService.getBusinessInfo();
    if(this.Business_table.length > 0){
      this.TableHead = tablehead;
    }else if(this.Business_table.length == 0){
      this.NoRecord = 'No Results Avalaible'
    }
    this.latitude = 0;
    this.longitude = 0;
  }
  // goDown(){
  //   this.scroller.scrollToAnchor("noRecordsDisplay");
  // }

  detail_fun(i:number){
    this.BusinessLink = '';
    this.BusinessName = '';
    this.TwitterURL = '';
    this.FaceBookURL = '';
    this.Review_list = [];
    this.detail_id = '';
    this.flag_detail = false;
    var temp = this.Business_table[i].id
    this.detail_id = temp;
    console.log(this.detail_id)
    this.latitude = this.Business_table[i].latitude;
    this.longitude = this.Business_table[i].longitude;
    this.mapOptions = {
      center: {lat : this.latitude, lng : this.longitude},
      zoom : 14
    }
    this.marker = {
      position: { lat: this.latitude, lng: this.longitude },
    };
    this.onPre()
    this.flag_detail = true;
  }



async onPre(){
  this.filtered_detail = [];
  this.photo = [];
  await this.backendService.RequestBackendDetail(this.detail_id);
  //console.log(this.detail_id);
  this.detail_list= this.backendService.getDetail();
  var temp = this.detail_list[0];
  this.BusinessName = String(this.detail_list[0].name);
  if(typeof temp.address != 'undefined'){
    this.filtered_detail.push({title:"address",value:temp.address})
  }
  if(typeof temp.category != 'undefined'){
    this.filtered_detail.push({title:"category",value:temp.category});
  }
  if(typeof temp.phone_number != 'undefined'){
    this.filtered_detail.push({title:"Phone Number",value:String(temp.phone_number)})
  }
     if(typeof temp.price != 'undefined'){
    this.filtered_detail.push({title:"price",value:String(temp.price)})
  }
  if(typeof temp.status != 'undefined'){
  if(String(temp.status) == 'true'){
    this.filtered_detail.push({title:"status",value:"Open"});
    }else{
    this.filtered_detail.push({title:"status",value:"Closed"});
    }
  }
  if(typeof temp.info != 'undefined'){
    this.filtered_detail.push({title:"More Info",value:String(temp.info)})
    this.BusinessLink = String(temp.info);
  }
  if(this.filtered_detail.length %2 ==1){
    this.filtered_detail.push({title:"",value:""});
  }
  if(typeof temp.photo_list != 'undefined'){
    this.photo = temp.photo_list;
  }
  //this.scroller.scrollToAnchor("ResultDetail");
  //console.log(this.filtered_detail)
  await this.backendService.RequestBackendReview(this.detail_id);
  this.Review_list = this.backendService.getReview();
  var List = JSON.parse(localStorage.getItem("booking") || "[]");
  for(var j = 0 ; j<List.length;j++){
    if(List[j].BusinessName == this.detail_list[0].name){
      this.Reserve_flag = true;
    }
  }
  this.TwitterURL = 'https://twitter.com/intent/tweet?text=Check ' + this.BusinessName + ' on Yelp.%0A&url=' + this.BusinessLink;
  this.FaceBookURL = 'https://www.facebook.com/sharer/sharer.php?quote=Check ' + this.BusinessName + ' on Yelp.%0A&u=' + this.BusinessLink;
}

OpenReservation(){
  const transModalRef = this.transModalService.open(
    ReservationComponent
  );
  transModalRef.componentInstance.name = this.detail_list[0].name;
  transModalRef.result.then((recItem) => {
    // trigger opt alert
    if(recItem != 'Close click'){
      window.alert("Reservation Created");
      this.Reserve_flag = true;
    }
    // for buy alert
  });
}

  OnCancel(){
    var List = JSON.parse(localStorage.getItem("booking") || "[]");
    for(var j = 0 ; j<List.length;j++){
      if(List[j].BusinessName == this.detail_list[0].name){
        List.splice(j,1);
      }
    }
    localStorage.setItem('booking', JSON.stringify(List));
    window.alert("Reservation cancelled");
    this.Reserve_flag = false;
  }

  OnClear(){
    this.checkoutForm.reset();
    this.NoRecord = '';
    this.TableHead = [];
    this.Business_table = [];
    this.detail_list = [];
    this.filtered_detail = [];
    this.flag_detail = false;
    this.checkoutForm.get('location')?.enable();
  }


  ngOnInit(): void {

    this.checkoutForm.get('keyword')?.valueChanges
    .pipe(
      startWith(''),
      filter(res => {
        return res !== null && res.length >= this.minLengthTerm
      }),
      tap(() => {
        this.isLoading = true;
      }),
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap(value => 
        this.backendService.RequestBackendAutoComplete(String(value)||'').pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
      )
    )
    .subscribe((response:any) => {
      this.filtered_keyword = response;
      
    });
  }

}
