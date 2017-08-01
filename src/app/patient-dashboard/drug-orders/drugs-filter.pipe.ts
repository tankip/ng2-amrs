import { Pipe, PipeTransform, Injectable } from '@angular/core';
@Pipe({
    name: 'drugsFilter',
    pure: false
})
@Injectable()
export class DrugsFilterPipe implements PipeTransform {
    transform(drugOrders: any, searchText: any): any {
    if (searchText == null) return drugOrders;

    return drugOrders.filter(function(drugOrder){
      return drugOrder.display.toUpperCase().indexOf(searchText.toUpperCase()) > -1;
    });
  }
}
