import { inject, Injectable } from '@angular/core';
import { environment } from './environments/environment';
import { HttpClient } from '@angular/common/http';
import { Column } from './interfaces/columns';
import { Observable, map } from 'rxjs';
import { Response } from './interfaces/response';
import { Lego } from './interfaces/lego';

@Injectable({
  providedIn: 'root'
})
export class LegoService {
  private http          : HttpClient;

  constructor() {
    this.http           = inject(HttpClient);
  }

  getColumns(): Observable<Column[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/columns`).pipe(
      map(columns => columns.map(column => ({
        field: column,
        header: column.replace(/_/g, ' ')
      })))
    );
  }

  getInputOptions(column: string, value: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/options?column=${column}&value=${value}`)
  }

  getLegos(column: string, value: string, limit: number, page: number): Observable<Response> {
    return this.http.get<Response>(`${environment.apiUrl}/legos?column=${column}&value=${value}&limit=${limit}&page=${page}`)
  }

  getImage(value: string, type: string): Observable<string> {
    return this.http.get<string>(`${environment.apiUrl}/image?value=${value}&type=${type}`);
  }

  editLego(lego: Lego): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}`, { lego });
  }

}
