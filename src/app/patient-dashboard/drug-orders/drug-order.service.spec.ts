/* tslint:disable:no-unused-variable */
import { TestBed, async, inject  } from '@angular/core/testing';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { Http, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { DrugOrderService } from './drug-order.service';
import { DrugResourceService } from '../../openmrs-api/drug-resource.service';
import { ConceptResourceService } from '../../openmrs-api/concept-resource.service';
import { ProviderResourceService } from '../../openmrs-api/provider-resource.service';
import { EncounterResourceService } from '../../openmrs-api/encounter-resource.service';
import { PersonResourceService } from '../../openmrs-api/person-resource.service';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { LocalStorageService } from '../../utils/local-storage.service';
import { LocationResourceService } from '../../openmrs-api/location-resource.service';
import { OrderResourceService } from '../../openmrs-api/order-resource.service';
import { DataCacheService } from '../../shared/services/data-cache.service';
import { CacheService } from 'ionic-cache/ionic-cache';

describe('Service: Drug Order Service', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DrugOrderService,
                MockBackend,
                BaseRequestOptions,
                ConceptResourceService,
                AppSettingsService,
                LocalStorageService,
                DrugResourceService,
                ProviderResourceService,
                PersonResourceService,
                EncounterResourceService,
                OrderResourceService,
                DataCacheService,
                CacheService,
                LocationResourceService,
                {
                    provide: Http,
                    useFactory: (backendInstance: MockBackend,
                        defaultOptions: BaseRequestOptions) => {
                        return new Http(backendInstance, defaultOptions);
                },
          deps: [MockBackend, BaseRequestOptions]
        },
            ]
        });
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should create an instance', () => {
        let service: DrugOrderService = TestBed.get(DrugOrderService);
        expect(service).toBeTruthy();
    });

    it('should get provider by person Uuid', (done) => {
        let service: DrugOrderService = TestBed.get(DrugOrderService);
        let result = service.getProviderByPersonUuid('uuid');

        result.subscribe((results) => {
            if (results) {
                expect(results).toBeTruthy();
            }
            done();
        });
    });

    it('should have all the required functions defined and callable', (done) => {
        let service: DrugOrderService = TestBed.get(DrugOrderService);

        spyOn(service, 'findDrug').and.callFake((err, data) => { });
        let searchText = 'drug';
        service.findDrug(searchText);
        expect(service.findDrug).toHaveBeenCalled();

        spyOn(service, 'getProviderByPersonUuid').and.callFake((err, data) => { });
        let uuid = 'xxxx-aaaa';
        service.getProviderByPersonUuid(uuid);
        expect(service.getProviderByPersonUuid).toHaveBeenCalled();

        spyOn(service, 'findLocation').and.callFake((err, data) => { });
        let locationText = 'location';
        service.findLocation(locationText);
        expect(service.findLocation).toHaveBeenCalled();

        done();

    });

});

