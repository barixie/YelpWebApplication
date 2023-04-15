import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import Validation from '../validation';
@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal,
              public datepipe: DatePipe,
              private formBuilder: FormBuilder,
            ) { }

  @Input() public name : string = '';
  @Output() notify = new EventEmitter();

  form: FormGroup = new FormGroup({
    email: new FormControl(''),
    date: new FormControl(''),
    time_hour : new FormControl(''),
    time_interval : new FormControl(''),
  });

  submitted = false;

  // email : string = '';

  // date : string = '';

  // time_hour: string = '';
  
  // time_interval : string='';

  todayDate=this.datepipe.transform(new Date(), 'yyyy-MM-dd');

  Time_hour : number[] = [10,11,12,13,14,15,16,17];
  Time_interval : string [] = ['00','15','30','45'];

  convert(str:string) {
    var date_temp = new Date(str),
      mnth = ("0" + (date_temp.getMonth() + 1)).slice(-2),
      day = ("0" + date_temp.getDate()).slice(-2);
  return [date_temp.getFullYear(), mnth, day].join("-");
  }

  OnSubmit(){
    //localStorage.clear();
    console.log(this.form.value);
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    var date_trans = this.convert(this.form.value.date);
    var time = String(this.form.value.time_hour) + ':' + String(this.form.value.time_interval);
    var reservation = {"email":this.form.value.email, "date":date_trans, "BusinessName": this.name, "Time":time};
    let portfolioArr = JSON.parse(localStorage.getItem('booking') || '[]');
    if(portfolioArr.length == 0){
      portfolioArr.push(reservation);
      localStorage.setItem("booking",JSON.stringify(portfolioArr));
    }else{
      portfolioArr.push(reservation);
      localStorage.setItem("booking",JSON.stringify(portfolioArr));
    }
    //this.notify.emit();
    //console.log(JSON.parse(localStorage.getItem('booking') || '[]'));
    this.activeModal.close();
    this.submitted = false;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        date: ['', Validators.required],
        time_hour: ['',Validators.required],
        time_interval: ['',Validators.required],
      },
      {
        validators: [Validation.match('password', 'confirmPassword')],
      }
    );
  }

}
