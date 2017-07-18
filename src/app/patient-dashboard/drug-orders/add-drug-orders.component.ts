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
  modal: ModalComponent;

  patient: any;
  error: string;
  subscription: Subscription;
  drugs = [];
  locations = [];
  frequencies: string;
  durationUnits;
  drugName: string;
  location: string;
  dose: number;
  dosageForm: string;
  dosageFormv: string;
  route: string;
  routev: string;
  frequency: string;
  asNeeded: boolean = false;
  asNeededReason: string;
  dosingInstructions: string;
  refills: number;
  encounter: string;
  personUuid: string;
  orderer: string;
  ordererName: string;
  startDate = new Date();
  quantity: number;
  quantityUnits;
  quantityUnit: string;
  selectedDrug: string;
  selectedLocation: string;
  drugList = false;
  locationList = false;
  currentDate;
  caresetting: string = '6f0c9a92-6f24-11e3-af88-005056821db0';
  action: string = 'NEW';
  submittedDrugOrder;
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

  ngOnInit() {
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
        }
      }
    );
  }

  getProvider() {
    this.drugOrderService.getProviderByPersonUuid(this.personUuid).subscribe((data) => {
      this.orderer = data.providerUuid;
      this.ordererName = data.label;
    });
  }

  findDrug(searchText) {
    this.drugList = true;
    this.drugOrderService.findDrug(searchText).subscribe((data) => {
      this.drugs = data;
    });
  }

  drugChanged(drug) {
    this.drugList = false;
    this.drugName = drug.name;
    this.selectedDrug = drug.uuid;
    this.dosageForm = drug.dosageForm.display;
    this.route = drug.route.display;
    this.routev = drug.route.uuid;
    this.dosageFormv = drug.dosageForm.uuid;
  }

  findLocation(searchText) {
    this.locationList =  true;
    this.drugOrderService.findLocation(searchText).subscribe((data) => {
      this.locations = data;
    });
  }

  locationChanged(location) {
    this.locationList = false;
    this.location = location.label;
    this.selectedLocation = location.value;
  }

  getOrderEntryConfigs() {
    this.orderResourceService.getOrderEntryConfig().subscribe((data) => {
      this.durationUnits = data.durationUnits;
      this.frequencies = data.orderFrequencies;
      this.quantityUnits = data.drugDispensingUnits;
    });
  }

  createPayload () {
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

  saveOrder() {
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
          });
        } else {
          this.error = 'Error creating Encounter';
        }
      });
    }

  }
  close() {
    this.modal.close();
    this.drurOrder.addOrder(false);
  }
}
