import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { MockBackend, MockConnection } from '@angular/http/testing';
import
{ Http, Response, Headers, BaseRequestOptions, ResponseOptions, RequestMethod }
from '@angular/http';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { DrugResourceService } from './drug-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';

describe('Service : DrugResourceService Unit Tests', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        AppSettingsService,
        LocalStorageService,
        DrugResourceService
      ],
    });
  }));
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be injected with all dependencies',
    inject([DrugResourceService],
      (drugResourceService: DrugResourceService) => {
        expect(DrugResourceService).toBeTruthy();
      })
    );
  it('should return a list of drugs matching the search string provided',
    inject([MockBackend, DrugResourceService],
        (backend: MockBackend, drugResourceService: DrugResourceService) => {
        let searchText = 'test';
        backend.connections.subscribe((connection: MockConnection) => {
            expect(connection.request.url).toContain('q=' + searchText);
            expect(connection.request.url).toContain('v=');

            let options = new ResponseOptions({
                body: JSON.stringify({
                    results: [
                    {
                        uuid: 'uuid',
                        display: ''
                    },
                    {
                        uuid: 'uuid',
                        display: ''
                    }
                    ]
                })
            });
            connection.mockRespond(new Response(options));
        });

        drugResourceService.searchDrug(searchText)
            .subscribe((data) => {
            expect(data.length).toBeGreaterThan(0);
            });
        })
    );
    it('should make a call with the correct parameters',
    inject([DrugResourceService, MockBackend],
      (drugResourceService: DrugResourceService, backend: MockBackend) => {
        let expectedResults = {'result': {'orderuid': '1234'}};
        backend.connections.subscribe((connection: MockConnection) => {
          expect(connection.request.method).toBe(RequestMethod.Post);
          expect(connection.request.url).toContain('order');
          connection.mockRespond(new Response(
            new ResponseOptions({
                body: expectedResults
              }
            )));
        });

        let payload = {
          'test': 'test'
        };

        drugResourceService.saveDrugOrder(payload)
          .subscribe((result) => {
            expect(result).toBeDefined();
            expect(result).toEqual(expectedResults);
          });
      })
  );
});
