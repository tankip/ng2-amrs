import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs/Rx';
import { ConceptResourceService } from '../../openmrs-api/concept-resource.service';
import { DrugResourceService } from '../../openmrs-api/drug-resource.service';
import { ProviderResourceService } from '../../openmrs-api/provider-resource.service';
import { EncounterResourceService } from '../../openmrs-api/encounter-resource.service';
import { LocationResourceService } from '../../openmrs-api/location-resource.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import * as _ from 'lodash';

@Injectable()

export class DrugOrderService {

private encounterUuid: string = null;
private encounter: any = null;

constructor( private conceptResourceService: ConceptResourceService,
            private drugResourceService: DrugResourceService,
            private providerResourceService: ProviderResourceService,
            private encounterResource: EncounterResourceService,
            private locationResourceService: LocationResourceService,
            private orderResourceService: OrderResourceService
) {}


  findDrug(searchText) {
    let drugResults: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    this.drugResourceService.searchDrug(searchText).subscribe((drugs) => {
      let filtered = _.filter(drugs, (drug: any) => {
        if (drug.concept.conceptClass &&
          drug.concept.conceptClass.uuid === '8d490dfc-c2cc-11de-8d13-0010c6dffd0f') {
          return true;
        } else {
          return false;
        }
      });
      let mappedDrugs = this.mapDrugs(filtered);
      drugResults.next(mappedDrugs);
    });
    return drugResults.asObservable();
  }

  mapDrugs(drugs) {
    let mappedDrugs = drugs.map((drug) => {
      return {
        uuid: drug.uuid,
        name: drug.name,
        concept: drug.concept,
        dosageForm: drug.dosageForm,
        route: drug.route
      };
    });
    return mappedDrugs;
  }

  getProviderByPersonUuid(uuid) {
    let providerSearchResults: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    this.providerResourceService.getProviderByPersonUuid(uuid)
      .subscribe(
      (provider) => {
        let mappedProvider = {
          label: (provider as any).display,
          value: (provider as any).person.uuid,
          providerUuid: (provider as any).uuid
        };
        providerSearchResults.next(mappedProvider);
      },
      (error) => {
        providerSearchResults.error(error);
      }

      );
    return providerSearchResults.asObservable();
  }

  findLocation(searchText): Observable<Location[]> {
    let locationSearchResults: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    let findLocation = this.locationResourceService.searchLocation(searchText, false);
    findLocation.subscribe(
      (locations) => {
        let mappedLocations = locations.map((l: any) => {
          return {
            value: l.uuid,
            label: l.display
          };
        });
        locationSearchResults.next(mappedLocations);
      },
      (error) => {
        locationSearchResults.error(error);
      }
    );
    return locationSearchResults.asObservable();
  }

  saveOrder(payload) {
    return this.orderResourceService.saveDrugOrder(payload);
  }

}
