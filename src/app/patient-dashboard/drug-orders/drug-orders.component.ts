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

  patient: any;
  activedrugOrders = [];
  inactivedrugOrders = [];
  error: string;
  page: number = 1;
  fetchingResults: boolean;
  isBusy: boolean;
  subscription: Subscription;
  displayDialog: boolean = false;
  addOrders: boolean = false;
  currentOrder: any;
  orderTypes;
  personUuid;
  provider;
  private allItemsSelected = false;
  private copies = 2;
  private patientIdentifer: any;
  private isPrinting = false;
  private collectionDate = new Date();

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

  getCurrentlyLoadedPatient() {
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
          this.getDrugOrders();
        }
      }
    );
  }
  getProvider() {
    this.drugOrderService.getProviderByPersonUuid(this.personUuid).subscribe((data) => {
      this.provider = data.providerUuid;
    });
  }

  getDrugOrders() {
    this.fetchingResults = true;
    let drugs = [];
    let activeDrugs = [];
    let inactiveDrugs = [];
    this.isBusy = true;
    let patientUuId = this.patient.uuid;
    this.orderResourceService.getOrdersByPatientUuid(patientUuId).subscribe((data) => {
      data.results.forEach((value) => {
        if (value.orderType.uuid === '131168f4-15f5-102d-96e4-000c29c2a5d7') {
          drugs.push(value);
        }
      });
      if (drugs) {
        drugs.forEach((value) => {
          if (value.action === 'NEW') {
            activeDrugs.push(value);
          } else if (value.action === 'DISCONTINUE') {
            inactiveDrugs.push(value);
          }
        });

        this.activedrugOrders = activeDrugs;
        this.inactivedrugOrders = inactiveDrugs;
      }
    });
  }

  addOrder(show) {
    this.addOrders = show;
  }

  discontinueOrder(order) {
    let orderToDiscontinue;

    this.orderResourceService.getOrderByUuid(order.uuid).subscribe((data) => {
      orderToDiscontinue = data;
      if (orderToDiscontinue) {
        let discontinuePayload = {
          orderer: this.provider,
          patient: orderToDiscontinue.patient.uuid,
          previousOrder : orderToDiscontinue.uuid,
          careSetting : orderToDiscontinue.careSetting.uuid,
          concept : orderToDiscontinue.concept.uuid,
          encounter : orderToDiscontinue.encounter.uuid,
          drug : orderToDiscontinue.drug.uuid,
          action : 'DISCONTINUE',
          type : 'drugorder'
        };
        this.orderResourceService.saveDrugOrder(discontinuePayload).subscribe((response) => {
          window.confirm('Successfully Discontinued order:' + response.orderNumber);
          window.location.reload();
        });
      }
    });

  }
}
