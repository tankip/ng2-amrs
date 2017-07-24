import { Component, OnInit, Input } from '@angular/core';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import { PatientService } from '../patient.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { UserService } from '../../openmrs-api/user.service';
import { DrugOrderService } from './drug-order.service';

import { Subscription } from 'rxjs';
import * as Moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-drug-orders',
  templateUrl: './drug-orders.component.html',
  styleUrls: ['./drug-orders.component.css']
})
export class DrugOrdersComponent implements OnInit {

  activeDrugOrders = [];
  error: string;
  page: number = 1;
  fetchingResults: boolean;
  isBusy: boolean;
  caresetting: string = '6f0c9a92-6f24-11e3-af88-005056821db0';
  subscription: Subscription;
  addOrders: boolean = false;
  private personUuid: string;
  private provider: string;
  private patient: any;
  private patientIdentifer: any;

  constructor(private appFeatureAnalytics: AppFeatureAnalytics,
    private patientService: PatientService,
    private userService: UserService,
    private orderResourceService: OrderResourceService,
    private drugOrderService: DrugOrderService,
  ) {}

  ngOnInit() {
    this.appFeatureAnalytics
      .trackEvent('Patient Dashboard', 'Patient Orders Loaded', 'ngOnInit');
      this.getCurrentlyLoadedPatient();
      this.personUuid =  this.userService.getLoggedInUser().personUuid;
      this.getProvider();
  }

  public getCurrentlyLoadedPatient() {
    this.subscription = this.patientService.currentlyLoadedPatient.subscribe(
      (patient) => {
        if (patient) {
          this.patient = patient;
          let amrsId = _.find(this.patient.identifiers.openmrsModel,
            (identifer: any) => {
              if (identifer.identifierType.uuid === '58a4732e-135x9-11df-a1f1-0026b9348838') {
                return true;
              }
            });
          if (amrsId) {
            this.patientIdentifer = amrsId.identifier;
          }
          this.getDrugOrders();
        }
      }
    );
  }
  public getProvider() {
    this.drugOrderService.getProviderByPersonUuid(this.personUuid).subscribe((data) => {
      this.provider = data.providerUuid;
    });
  }

  public getDrugOrders() {
    this.fetchingResults = true;
    let drugs = [];
    this.isBusy = true;
    let patientUuId = this.patient.uuid;
    this.orderResourceService.getAllOrdersByPatientUuuid(patientUuId, this.caresetting)
    .subscribe((data) => {
      data.results.forEach((value) => {
        if (value.orderType.uuid === '131168f4-15f5-102d-96e4-000c29c2a5d7') {
          drugs.push(value);
        }
      });
      if (drugs) {
        this.activeDrugOrders = drugs.reverse();
        this.fetchingResults = false;
        this.isBusy = false;
      }
    });
  }

  public addOrder(show) {
    this.addOrders = show;
  }

  public discontinueOrder(order) {
    this.orderResourceService.getOrderByUuid(order.uuid).subscribe((data) => {
      if (!data.dateStopped) {
        let discontinuePayload = this.createPayload(data, 'DISCONTINUE');
        if (window.confirm('Are You Sure You Want To Discontnue This Order?')) {
          this.drugOrderService.saveOrder(discontinuePayload).subscribe((success) => {
            window.alert('The Order was Successfully Discontinued');
          });
        }
      }
    });

  }

  public renewOrder(order) {
    this.orderResourceService.getOrderByUuid(order.uuid).subscribe((data) => {
      if (data.dateStopped) {
        let renewPayload = this.createPayload(data, 'RENEW');
        if (window.confirm('Are You Sure You Want To Renew This Order?')) {
          this.drugOrderService.saveOrder(renewPayload).subscribe((success) => {
            window.alert('The Order was Successfully Renewed');
          }, (err) => {
            err = err.json();
            window.alert('There was an error: ' + err.error.message);
          });
        }
      } else if (!data.dateStopped) {

        let discontinuePayload = this.createPayload(data, 'DISCONTINUE');
        let dis = this.drugOrderService.saveOrder(discontinuePayload).subscribe((success) => {
          return true;
        }, (err) => {
          return false;
        });

        if (dis) {
          let payload = this.createPayload(data, 'RENEW');
          if (window.confirm('Are You Sure You Want To Renew This Order?')) {
            this.drugOrderService.saveOrder(payload).subscribe((response) => {
              window.alert('The Order was Successfully Renewed');
            });
          }
        } else {
          window.alert('The Order was Successfully Renewed');
        }

      }
    });
  }

  private createPayload(order, action) {
    if (action === 'DISCONTINUE') {
      return {
        orderer: this.provider,
        patient: order.patient.uuid,
        previousOrder : order.uuid,
        careSetting : order.careSetting.uuid,
        concept : order.concept.uuid,
        encounter : order.encounter.uuid,
        action : 'DISCONTINUE',
        type : 'drugorder'
      };
    } else if (action === 'RENEW') {
      return {
        orderer: this.provider,
        patient: order.patient.uuid,
        previousOrder : order.uuid,
        careSetting : order.careSetting.uuid,
        concept : order.concept.uuid,
        encounter : order.encounter.uuid,
        dose : order.dose,
        doseUnits : order.doseUnits.uuid,
        route : order.route.uuid,
        frequency : order.frequency.uuid,
        quantity : order.quantity,
        quantityUnits : order.quantityUnits.uuid,
        numRefills : order.numRefills,
        action : 'RENEW',
        type : 'drugorder'
      };
    }

  }
}
