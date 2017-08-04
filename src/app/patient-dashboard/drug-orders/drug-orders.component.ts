import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import { PatientService } from '../patient.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { UserService } from '../../openmrs-api/user.service';
import { DrugOrderService } from './drug-order.service';

import { Subscription } from 'rxjs';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-drug-orders',
  templateUrl: './drug-orders.component.html',
  styleUrls: ['./drug-orders.component.css']
})
export class DrugOrdersComponent implements OnInit {

  @ViewChild('modal')
  modal: ModalComponent;

  drugOrders = [];
  activeDrugOrders = [];
  inactiveDrugOrders = [];
  selectedOrders = [];
  orderStatus = [];
  reviseOrders;
  frequencies: string;
  error: string;
  page: number = 1;
  fetchingResults: boolean;
  isBusy: boolean;
  caresetting: string = '6f0c9a92-6f24-11e3-af88-005056821db0';
  subscription: Subscription;
  addOrders: boolean = false;
  searchText: string;
  column: string;
  isDesc: boolean = false;
  drug: string;
  previousOrder: string;
  concept: string;
  encounter: string;
  dose: DoubleRange;
  doseUnits: string;
  route: string;
  frequency: string;
  orderReasonNonCoded: string;
  instructions: string;
  numRefills: number;
  quantity: number;
  quantityUnits: string;
  private personUuid: string;
  private provider: string;
  private patient: any;
  private patientIdentifer: any;

  constructor(private appFeatureAnalytics: AppFeatureAnalytics,
    private patientService: PatientService,
    private userService: UserService,
    private orderResourceService: OrderResourceService,
    private drugOrderService: DrugOrderService
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
        this.drugOrders = drugs.reverse();
        this.selectedOrders = this.drugOrders;
        this.filterOrders(this.drugOrders);
        this.drugOrders.forEach((value) => {
          if (value.dateStopped) {
            this.inactiveDrugOrders.push(value);
          } else if (!value.dateStopped) {
            this.activeDrugOrders.push(value);
          }
        });
        this.fetchingResults = false;
        this.isBusy = false;
      }
    });
  }

  public addOrder(show) {
    this.addOrders = show;
  }


  public onOrderStatuChange(status) {
    if ( status === 'INACTIVE') {
      this.selectedOrders = this.inactiveDrugOrders;
    } else if ( status === 'ACTIVE') {
      this.selectedOrders = this.activeDrugOrders;
    } else {
      this.selectedOrders = this.drugOrders;
    }
  }

  public discontinueOrder(order) {
    this.orderResourceService.getOrderByUuid(order.uuid).subscribe((data) => {
      if (!data.dateStopped) {
        let discontinuePayload = this.createPayload(data, 'DISCONTINUE');
        if (window.confirm('Are You Sure You Want To Discontnue This Order?')) {
          this.drugOrderService.saveOrder(discontinuePayload).subscribe((success) => {
            window.alert('The Order was Successfully Discontinued');
            this.getDrugOrders();
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
            this.getDrugOrders();
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
              this.getDrugOrders();
            });
          }
        } else {
          window.alert('The Order was Successfully Renewed');
        }

      }
    });
  }

  public reviseOrder(order) {
    this.orderResourceService.getOrderEntryConfig().subscribe((data) => {
      this.frequencies = data.orderFrequencies;
    });
    this.orderResourceService.getOrderByUuid(order.uuid).subscribe((data) => {
      this.reviseOrders = data;
      this.drug = this.reviseOrders.display;
      this.instructions = this.reviseOrders.dosingInstructions;
      this.orderReasonNonCoded = this.reviseOrders.orderReasonNonCoded;
      this.dose = this.reviseOrders.dose;
      this.doseUnits = this.reviseOrders.doseUnits.display;
      this.route = this.reviseOrders.route.display;
      this.quantity =  this.reviseOrders.quantity;
      this.quantityUnits = this.reviseOrders.quantityUnits.display;
      this.numRefills =  this.reviseOrders.numRefills;
      if (this.reviseOrders) {
        this.modal.open();
      }
    });
  }
  saveOrder() {
    if (!this.frequency) {
      this.error = 'Frequency is required';
    } else if (!this.dose) {
      this.error = 'Dose is required';
    } else if (!this.quantity) {
      this.error = 'Quantity is required';
    } else if (!this.numRefills) {
      this.error = 'Refills is required';
    } else {
      let reviseOrderPayload = this.createPayload(this.reviseOrders, 'REVISE');
        if (window.confirm('Are You Sure You Want To Revise This Order?')) {
          this.drugOrderService.saveOrder(reviseOrderPayload).subscribe((success) => {
            window.alert('The Order was Successfully Revised');
            this.close();
            this.getDrugOrders();
          }, (err) => {
            err = err.json();
            window.alert('There was an error: ' + err.error.message);
          });
        }
      this.error = '';
    }
  }
  close() {
    this.modal.close();
  }

  public sort(property) {
    this.isDesc = !this.isDesc;
    this.column = property;
    let direction = this.isDesc ? 1 : -1;

    this.selectedOrders.sort(function(a, b){
        if (a[property] < b[property]) {
            return -1 * direction;
        } else if ( a[property] > b[property]) {
            return 1 * direction;
        } else {
            return 0;
        }
    });
  };

  private filterOrders(orders) {
    let orderStatus = [];
    orders.forEach((value) => {
      if (value.dateStopped) {
        orderStatus.push('INACTIVE');
      } else if (!value.dateStopped) {
        orderStatus.push('ACTIVE');
      }
    });
    if (orderStatus.length > 0) {
      this.orderStatus = this.getUniqueNames(orderStatus);
    }
  }
  private getUniqueNames(originArr) {
    let newArr = [];
    let originLength = originArr.length;
    let found, x, y;
    for (x = 0; x < originLength; x++) {
      found = undefined;
      for (y = 0; y < newArr.length; y++) {
        if (originArr[x] === newArr[y]) {
          found = true;
          break;
        }
      }
      if (!found) {
        newArr.push(originArr[x]);
      }
    }
    return newArr;
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
    } else if (action === 'REVISE') {
      return {
        type : 'drugorder',
        action : 'REVISE',
        previousOrder : order.uuid,
        patient : this.patient.uuid,
        careSetting : order.careSetting.uuid,
        concept : order.concept.uuid,
        encounter : order.encounter.uuid,
        instructions : this.instructions,
        orderReasonNonCoded : this.orderReasonNonCoded,
        orderer: this.provider,
        dose: this.dose,
        doseUnits: order.doseUnits.uuid,
        route: order.route.uuid,
        frequency: this.frequency,
        quantity: this.quantity,
        quantityUnits: order.quantityUnits.uuid,
        numRefills: this.numRefills
      };
    }

  }
}
