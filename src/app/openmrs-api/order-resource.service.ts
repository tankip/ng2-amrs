import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable, Subject, ReplaySubject } from 'rxjs/Rx';
import * as _ from 'lodash';

@Injectable()
export class OrderResourceService {

  public v: string = 'custom:(display,uuid,orderNumber,orderType,accessionNumber,' +
  'orderReason,orderReasonNonCoded,urgency,careSetting,action,' +
  'commentToFulfiller,dateActivated,dateStopped,instructions,orderer:default,' +
  'encounter:full,patient:default,concept:ref)';

  constructor(protected http: Http,
              protected appSettingsService: AppSettingsService) {
  }

  public getUrl(): string {

    return this.appSettingsService.getOpenmrsRestbaseurl().trim() + 'order';
  }

  public searchOrdersById(orderId: string, cached: boolean = false, v: string = null):
  Observable<any> {

    let url = this.getUrl();
    url += '/' + orderId;
    let params: URLSearchParams = new URLSearchParams();
    params.set('v', (v && v.length > 0) ? v : this.v);

    return this.http.get(url, {
      search: params
    }).map((response: Response) => {
      return this._excludeVoidedOrder(response.json());
    });
  }

  public getOrdersByPatientUuid(patientUuid: string, cached: boolean = false, v: string = null):
  Observable<any> {

    let url = this.getUrl();
    let params: URLSearchParams = new URLSearchParams();
    params.set('patient', patientUuid);

    params.set('v', (v && v.length > 0) ? v : this.v);
    return this.http.get(url, {
      search: params
    }).map((response: Response) => {
      return response.json();
    });
  }

  public getAllOrdersByPatientUuuid(patientUuid: string, careSettingUuid: string,
                                    cached: boolean = false, v: string = null): Observable<any> {

    let url = this.getUrl();

    let params: URLSearchParams = new URLSearchParams();
    params.set('patient', patientUuid);
    params.set('careSetting', careSettingUuid);
    params.set('status', 'any');

    params.set('v', (v && v.length > 0) ? v : this.v);
    return this.http.get(url, {
      search: params
    }).map((response: Response) => {
      return response.json();
    });
  }

  public getOrderByUuid(uuid: string, cached: boolean = false, v: string = null): Observable<any> {

    let url = this.getUrl();
    url += '/' + uuid;

    return this.http.get(url).map((response: Response) => {
      return response.json();
    });
  }

  public getOrderEntryConfig(): Observable<any> {
    let url = this.appSettingsService.getOpenmrsRestbaseurl().trim() + 'orderentryconfig';
    return this.http.get(url).map((response: Response) => {
        return response.json();
    });
  }

  public saveDrugOrder(payload) {

    let url = this.getUrl();

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(url, payload, options)
      .map((response: Response) => {
        return response.json();
      });
  }

  private _excludeVoidedOrder(order) {
    if (!order) {
      return null;
    }
    if (order.voided === false) {
      return order;
    } else {
      return { orderVoided: true };
    }

  }

}
