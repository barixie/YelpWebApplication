import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mybooking',
  templateUrl: './mybooking.component.html',
  styleUrls: ['./mybooking.component.css']
})
export class MybookingComponent implements OnInit {

  constructor() { }

  List = JSON.parse(localStorage.getItem("booking") || "[]");

  NoRecord = this.List.length == 0;

  OnDelete(i:number){
    for(var j = 0 ; j<this.List.length;j++){
      if(j == i){
        this.List.splice(i,1);
      }
    }
    if(this.List.length == 0){
      this.NoRecord = true;
    }
    localStorage.setItem('booking', JSON.stringify(this.List));
    window.alert('Reservation Cancelled');
  }

  ngOnInit(): void {
  }

}
