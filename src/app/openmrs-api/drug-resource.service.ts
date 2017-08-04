import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable, Subject, ReplaySubject } from 'rxjs/Rx';
import * as _ from 'lodash';
import { AppSettingsService } from '../app-settings/app-settings.service';

@Injectable()
export class DrugResourceService {

  v: string = 'custom:(uuid,name,concept,route,dosageForm)';

  constructor(protected http: Http,
    protected appSettingsService: AppSettingsService) {
  }

  getUrl(): string {
    return this.appSettingsService.getOpenmrsRestbaseurl().trim() + 'drug';
  }

  searchDrug(searchText: string, cached: boolean = false, v: string = null): Observable<any> {

    let url = this.getUrl();

    let params: URLSearchParams = new URLSearchParams();

    params.set('q', searchText);

    params.set('v', (v && v.length > 0) ? v : this.v);

    return this.http.get(url, {
      search: params
    })
      .map((response: Response) => {
        return response.json().results;
      });
  }

  saveDrugOrder(payload) {
    let url = this.appSettingsService.getOpenmrsRestbaseurl().trim() + 'order';

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, payload, options)
      .map((response: Response) => {
        return response.json();
      });
  }


}
