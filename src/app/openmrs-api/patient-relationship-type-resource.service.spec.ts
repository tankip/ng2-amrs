import { async, inject, TestBed } from '@angular/core/testing';
import {
  BaseRequestOptions, Http, HttpModule, Response,
  ResponseOptions, RequestMethod
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { LocalStorageService } from '../utils/local-storage.service';
import { AppSettingsService } from '../app-settings/app-settings.service';
import {
  PatientRelationshipTypeResourceService
} from './patient-relationship-type-resource.service';

describe('Service: Pratient Relationship ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientRelationshipTypeResourceService,
        AppSettingsService,
        LocalStorageService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [
        HttpModule
      ]
    });
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should be defined', async(inject(
    [PatientRelationshipTypeResourceService, MockBackend], (service, mockBackend) => {

      expect(service).toBeDefined();
    })));
  let relationshipTypesResponse = {
    results: [{
      uuid: '7878d348-1359-11df-a1f1-0026b9348838',
      display: 'Parent/Child',
      description: 'Auto generated by OpenMRS',
      aIsToB: 'Parent',
      bIsToA: 'Child',
      retired: false,
      resourceVersion: '1.8'
    },
    {
      uuid: '7878d898-1359-11df-a1f1-0026b9348838',
      display: 'Doctor/Patient',
      description: 'Relationship from a primary care provider to the patient',
      aIsToB: 'Doctor',
      bIsToA: 'Patient',
      retired: false,
      resourceVersion: '1.8'
    }]
  };


  it('should call the right endpoint when getting person relationship types', (done) => {

    let s: PatientRelationshipTypeResourceService =
      TestBed.get(PatientRelationshipTypeResourceService);

    let backend: MockBackend = TestBed.get(MockBackend);

    backend.connections.subscribe((connection: MockConnection) => {

      expect(connection.request.url)
        .toEqual('http://example.url.com/ws/rest/v1/relationshiptype?v=full');
      expect(connection.request.url).toContain('v=');
      expect(connection.request.method).toBe(RequestMethod.Get);
      let options = new ResponseOptions({
        body: JSON.stringify(relationshipTypesResponse)
      });
      connection.mockRespond(new Response(options));
    });

    s.getPatientRelationshipTypes()
      .subscribe((response) => {
        done();
      });
  });

});





