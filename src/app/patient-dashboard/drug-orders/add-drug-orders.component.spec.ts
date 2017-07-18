import { TestBed, async, inject } from '@angular/core/testing';
import { Renderer, ElementRef } from '@angular/core';
import { AddDrugOrdersComponent } from './add-drug-orders.component';
import { DrugOrdersComponent } from './drug-orders.component';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, Response, Headers, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { FakeAppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytcis.mock';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import { PatientService } from '../patient.service';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { LocalStorageService } from '../../utils/local-storage.service';
import { DrugOrderService } from './drug-order.service';
import { PatientResourceService } from '../../openmrs-api/patient-resource.service';
import { DrugResourceService } from '../../openmrs-api/drug-resource.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { UserService } from '../../openmrs-api/user.service';
import {
  ProgramEnrollmentResourceService
} from '../../openmrs-api/program-enrollment-resource.service';
import { EncounterResourceService } from '../../openmrs-api/encounter-resource.service';
import { ConceptResourceService } from '../../openmrs-api/concept-resource.service';
import { ProviderResourceService } from '../../openmrs-api/provider-resource.service';
import { LocationResourceService } from '../../openmrs-api/location-resource.service';
import { PersonResourceService } from '../../openmrs-api/person-resource.service';
import { SessionStorageService } from '../../utils/session-storage.service';
import { DataCacheService } from '../../shared/services/data-cache.service';
import { CacheService } from 'ionic-cache/ionic-cache';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { UserDefaultPropertiesService } from
  '../../user-default-properties/user-default-properties.service';
import * as _ from 'lodash';

export class MockElementRef extends ElementRef {}

describe('Component: Add Drug Order Component Unit Tests', () => {
    let component;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AddDrugOrdersComponent,
                PatientService,
                OrderResourceService,
                DrugOrderService,
                DrugResourceService,
                PatientResourceService,
                ProgramEnrollmentResourceService,
                EncounterResourceService,
                ConceptResourceService,
                ProviderResourceService,
                PersonResourceService,
                SessionStorageService,
                LocationResourceService,
                DataCacheService,
                CacheService,
                UserService,
                UserDefaultPropertiesService,
                DrugOrdersComponent,
                UserDefaultPropertiesService,
                ModalComponent,
                {
                    provide: AppFeatureAnalytics, useFactory: () => {
                        return new FakeAppFeatureAnalytics();
                    }, deps: []
                },
                {
                    provide: Http, useFactory: (backend, options) => {
                        return new Http(backend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                { provide: ElementRef, useClass: MockElementRef },
                MockBackend,
                BaseRequestOptions,
                AppSettingsService,
                LocalStorageService
            ]
        });
        component = TestBed.get(AddDrugOrdersComponent);
    });
    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should instantiate the component', (done) => {

        expect(component).toBeTruthy();
        done();

    });

    it('should have all the required functions defined and callable', (done) => {
        spyOn(component, 'getProvider').and.callFake((err, data) => { });
        component.getProvider();
        expect(component.getProvider).toHaveBeenCalled();

        spyOn(component, 'findDrug').and.callFake((err, data) => { });
        let searchText = 'drug';
        component.findDrug(searchText);
        expect(component.findDrug).toHaveBeenCalled();

        spyOn(component, 'getOrderEntryConfigs').and.callFake((err, data) => { });
        component.getOrderEntryConfigs();
        expect(component.getOrderEntryConfigs).toHaveBeenCalled();

        spyOn(component, 'saveOrder').and.callFake((err, data) => { });
        component.saveOrder();
        expect(component.saveOrder).toHaveBeenCalled();

    done();

  });
});
