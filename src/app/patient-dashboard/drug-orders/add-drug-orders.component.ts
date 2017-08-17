import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import { PatientService } from '../patient.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { DrugOrderService } from './drug-order.service';
import { PatientPreviousEncounterService } from '../patient-previous-encounter.service';
import { DrugResourceService } from '../../openmrs-api/drug-resource.service';
import { UserService } from '../../openmrs-api/user.service';
import { EncounterResourceService } from '../../openmrs-api/encounter-resource.service';
import { UserDefaultPropertiesService } from
  '../../user-default-properties/user-default-properties.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { DrugOrdersComponent } from './drug-orders.component';

@Component({
  selector: 'add-drug-orders',
  templateUrl: './add-drug-orders.component.html'
})

export class AddDrugOrdersComponent implements OnInit {

  @ViewChild('modal')
  public modal: ModalComponent;

  public patient: any;
  public error: string;
  public subscription: Subscription;
  public drugs = [];
  public locations = [];
  public frequencies: string;
  public durationUnits;
  public drugName: string;
  public location: string;
  public dose: number;
  public dosageForm: string;
  public dosageFormv: string;
  public route: string;
  public routev: string;
  public frequency: string;
  public asNeeded: boolean = false;
  public asNeededReason: string;
  public dosingInstructions: string;
  public refills: number;
  public encounter: string;
  public personUuid: string;
  public orderer: string;
  public ordererName: string;
  public startDate = new Date();
  public quantity: number;
  public quantityUnits;
  public quantityUnit: string;
  public selectedDrug: string;
  public selectedLocation: string;
  public drugList = false;
  public locationList = false;
  public currentDate;
  public caresetting: string = '6f0c9a92-6f24-11e3-af88-005056821db0';
  public action: string = 'NEW';
  public submittedDrugOrder;
  private patientIdentifer: any;

  constructor(
    @Inject(DrugOrdersComponent) private drurOrder: DrugOrdersComponent,
    private appFeatureAnalytics: AppFeatureAnalytics,
    private patientService: PatientService,
    private orderResourceService: OrderResourceService,
    private drugOrderService: DrugOrderService,
    private drugResourceService: DrugResourceService,
    private userService: UserService,
    private userDefaultPropertiesService: UserDefaultPropertiesService,
    private encounterResourceService: EncounterResourceService
  ) {}

  public ngOnInit() {
    this.appFeatureAnalytics
    .trackEvent('Patient Dashboard', 'Patient Orders Loaded', 'ngOnInit');
    this.getCurrentlyLoadedPatient();
    this.personUuid =  this.userService.getLoggedInUser().personUuid;
    this.getProvider();
    this.getOrderEntryConfigs();
    let currentLocation = this.userDefaultPropertiesService.getCurrentUserDefaultLocationObject();
    this.location = currentLocation.display;
    this.selectedLocation = currentLocation.uuid;
    this.currentDate = Date.now();
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
        }
      }
    );
  }

  public getProvider() {
    this.drugOrderService.getProviderByPersonUuid(this.personUuid).subscribe((data) => {
      this.orderer = data.providerUuid;
      this.ordererName = data.label;
    });
  }

  public findDrug(searchText) {
    this.drugList = true;
    this.drugOrderService.findDrug(searchText).subscribe((data) => {
      this.drugs = data;
    });
  }

  public drugChanged(drug) {
    this.drugList = false;
    this.drugName = drug.name;
    this.selectedDrug = drug.uuid;
    this.dosageForm = drug.dosageForm.display;
    this.route = drug.route.display;
    this.routev = drug.route.uuid;
    this.dosageFormv = drug.dosageForm.uuid;
  }

  public findLocation(searchText) {
    this.locationList =  true;
    this.drugOrderService.findLocation(searchText).subscribe((data) => {
      this.locations = data;
    });
  }

  public locationChanged(location) {
    this.locationList = false;
    this.location = location.label;
    this.selectedLocation = location.value;
  }

  public getOrderEntryConfigs() {
    this.orderResourceService.getOrderEntryConfig().subscribe((data) => {
      this.durationUnits = data.durationUnits;
      this.frequencies = data.orderFrequencies;
      this.quantityUnits = data.drugDispensingUnits;
    });
  }

  public createPayload() {
    let drugOrderPayload;

    if (!this.selectedDrug) {
      this.error = 'Please Select A Drug Order';
    } else if (!this.frequency) {
      this.error = 'Frequency is Required Drug Order';
    } else if (!this.quantity || !this.quantityUnit) {
      this.error = 'Quantity and Quantity Unit are both required';
    } else if (!this.refills) {
      this.error = 'Please Provide Number of Refills';
    } else if ( !this.dose ) {
      this.error = 'Please Provide The Dose';
    } else if (!this.route || !this.dosageFormv) {
      this.error  = 'Route and Dosage Units are Required';
    } else {
      drugOrderPayload = {
        patient: this.patient.uuid,
        careSetting: this.caresetting,
        orderer: this.orderer,
        encounter: '',
        drug: this.selectedDrug,
        dose: this.dose,
        doseUnits: this.dosageFormv,
        route: this.routev,
        frequency: this.frequency,
        asNeeded: this.asNeeded,
        asNeededCondition: this.asNeededReason,
        instructions: this.dosingInstructions,
        numRefills: this.refills,
        action: this.action,
        quantity: this.quantity,
        quantityUnits: this.quantityUnit,
        type: 'drugorder'
      };
      this.error = '';
    }
    return drugOrderPayload;
  }

  public saveOrder() {
    let drugOrderPayload = this.createPayload();

    let encounterPayLoad = {
      patient: this.patient.uuid,
      encounterType: '5ef97eed-18f5-40f6-9fbf-a11b1f06484a',
      location: this.selectedLocation,
      provider: this.personUuid
    };

    if (this.error) {
      this.error = 'There was an error getting creating the Drug Order';
    } else {

      this.encounterResourceService.saveEncounter(encounterPayLoad).subscribe((response) => {
        if (response) {
          drugOrderPayload.encounter = response.uuid;
          this.drugResourceService.saveDrugOrder(drugOrderPayload).subscribe((res) => {
            this.submittedDrugOrder = res;
            this.modal.open();
            this.drurOrder.getDrugOrders();
          });
        } else {
          this.error = 'Error creating Encounter';
        }
      });
    }

  }
  public close() {
    this.modal.close();
    this.drurOrder.addOrder(false);
  }
}
