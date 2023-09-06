import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, order: 'asc' | 'desc' = 'asc'): any[] {
    return array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return order === 'asc' ? -1 : 1;
      } else if (a[field] > b[field]) {
        return order === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }
}
