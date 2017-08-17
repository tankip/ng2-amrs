import { Component, OnInit } from '@angular/core';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import { PatientService } from '../patient.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { Subscription } from 'rxjs';
import * as Moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-patient-orders',
  templateUrl: './patient-orders.component.html',
  styleUrls: ['./patient-orders.component.css']
})
export class PatientOrdersComponent implements OnInit {
  public patient: any;
  public patientOrders = [];
  public error: string;
  public page: number = 1;
  public fetchingResults: boolean;
  public isBusy: boolean;
  public subscription: Subscription;
  public displayDialog: boolean = false;
  public currentOrder: any;
  public orderType;
  public orderTypes = [
    'Test',
    'Drug'
  ];
  private allItemsSelected = false;
  private copies = 2;
  private patientIdentifer: any;
  private isPrinting = false;
  private collectionDate = new Date();
  constructor(private appFeatureAnalytics: AppFeatureAnalytics,
              private patientService: PatientService,
              private orderResourceService: OrderResourceService
  ) {}

  public ngOnInit() {
    this.appFeatureAnalytics.trackEvent('Patient Dashboard', 'Patient Orders Loaded', 'ngOnInit');
    this.getCurrentlyLoadedPatient();
  }

  public getCurrentlyLoadedPatient() {
    this.subscription = this.patientService.currentlyLoadedPatient.subscribe(
      (patient) => {
        if (patient) {
          this.patient = patient;
          let amrsId = _.find(this.patient.identifiers.openmrsModel,
            (identifer: any) => {
              if (identifer.identifierType.uuid === '58a4732e-1359-11df-a1f1-0026b9348838') {
                return true;
              }
            });
          if (amrsId) {
            this.patientIdentifer = amrsId.identifier;
          }
          this.getPatientOrders();
        }
      }
    );
  }

  public getPatientOrders() {
    this.fetchingResults = true;
    this.isBusy = true;
    let patientUuId = this.patient.uuid;
    this.orderResourceService.getOrdersByPatientUuid(patientUuId)
      .subscribe((result) => {
        this.patientOrders = result.results;
        this.patientOrders.sort((a, b) => {
          let key1 = a.dateActivated;
          let key2 = b.dateActivated;
          if (key1 > key2) {
            return -1;
          } else if (key1 === key2) {
            return 0;
          } else {
            return 1;
          }
        });
        this.fetchingResults = false;
        this.isBusy = false;
      }, (err) => {
        this.error = err;
        console.log('error', this.error);
      });
  }

}
