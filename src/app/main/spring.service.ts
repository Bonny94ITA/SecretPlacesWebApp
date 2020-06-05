import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Alternative} from './interfaceDB/alternative';
import {Room} from './interfaceDB/room';
import {Guest} from './interfaceDB/guest';
import {Router} from '@angular/router';
import {Booking} from './interfaceDB/booking';
import {Sojourn} from './interfaceDB/sojourn';

@Injectable({providedIn: 'root'})
export class SpringService {

    // private serverUrl = 'http://localhost:8080';
     private serverUrl = 'https://82.54.103.107:443';

    httpOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json'}),
        params: new HttpParams()
    };

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    // SEARCH
    searchClips(formdata: any): Observable<Alternative[]> {
        const url = `${this.serverUrl}/hotels/secretSearch`;
        return this.http.post<Alternative[]>(url, formdata)
            .pipe(
                catchError(this.handleError<Alternative[]>('getSecretSearch', null))
            );
    }


    normalSearch(formData): Observable<Room[]> {
        const url = `${this.serverUrl}/hotels/freeRooms`;
        return this.http.post<Room[]>(url, formData)
            .pipe(
                catchError(this.handleError<Room[]>('standardSearch', null))
            );
    }


    // REGISTER
    register(form: Guest): Observable<string> {
        const url = `${this.serverUrl}/guests/register`;
        return this.http.post(url, form, {responseType: 'text'})
            .pipe(
                catchError(this.handleError<string>('postRegisterItem', 'failed registration'))
            );
    }


    // LOGIN
    login(email: string, pwd: string | Int32Array): Observable<any> {
        const url = `${this.serverUrl}/guests/login`;
        return this.http.post<any>(url, {email: email, pwd: pwd})
            .pipe(
                catchError(this.handleError<any>('guestLogin', null))
            );
    }

    socialLogin(g: Guest): Observable<number> {
        const url = `${this.serverUrl}/guests/socialLogin`;
        return this.http.post<number>(url, g)
            .pipe(
                catchError(this.handleError<number>('socialLogin', null))
            );
    }

    // BOOKINGS
    getSavedBooking(): Observable<Booking[]> {
        const url = `${this.serverUrl}/bookings/saved/${JSON.stringify(this.getUser().id)}`;

        return this.http.get<Booking[]>(url, {headers: this.getHeaderWithToken()})
            .pipe(
                catchError(this.handleError<any>('getSavedBooking', []))
            );
    }

    getPaidBooking(): Observable<Booking[]> {
        const url = `${this.serverUrl}/bookings/paid/${JSON.stringify(this.getUser().id)}`;

        return this.http.get<Booking[]>(url, {headers: this.getHeaderWithToken()})
            .pipe(
                catchError(this.handleError<any>('getPaidBooking', []))
            );
    }

    getBookingsID(): Observable<number[]> {
        const url = `${this.serverUrl}/bookings/id/${JSON.stringify(this.getUser().id)}`;

        return this.http.get<number[]>(url, {headers: this.getHeaderWithToken()})
            .pipe(
                catchError(this.handleError<any>('getBookingsID', []))
            );
    }


    newBooking(booking: Booking): Observable<Booking> {
        const url = `${this.serverUrl}/bookings/insert`;
        return this.http.post<Booking>(url,
            {guest: this.getUser().id, booking: booking},
            {headers: this.getHeaderWithToken()})
                .pipe(
                    catchError(this.handleError<Booking>('newBooking', null))
                );
    }

    deleteBooking(bookingId: number): Observable<string> {
        const url = `${this.serverUrl}/bookings/delete/${JSON.stringify(bookingId)}`;
        return this.http.delete(url, {headers: this.getHeaderWithToken(), responseType: 'text'})
            .pipe(
                catchError(this.handleError<string>('deleteBooking', 'failed'))
            );
    }


    addToExistingBooking(id: number, soj: Sojourn): Observable<Booking> {
        const url = `${this.serverUrl}/bookings/addSojourn`;
        return this.http.post<Booking>(url, {bookingId: id, sojourn: soj}, {headers: this.getHeaderWithToken()})
            .pipe(
                catchError(this.handleError<Booking>('addSojournToExistingBooking', null))
            );
    }

    private getUser(): Guest{
        return JSON.parse(localStorage.getItem('user')) as Guest;
    }

    private getHeaderWithToken(): HttpHeaders{
        const token = localStorage.getItem('token_info');
        return new HttpHeaders({token_info: token});
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T): any {
        return (error: HttpErrorResponse): Observable<T> => {
            console.log('ERRORERERERERE: ' + JSON.stringify(error)); // log to console instead
            if (error.status === 401){
                alert('ritenta sarai più fortunato'); // da sistemare, gestire quando fallisce token, quando user non esiste o quando pwd è sbagliata
                this.router.navigate(['/login']);
                return;
            }
            if (error.status === 500) {
                this.router.navigate(['errors/error-500']);
                return;
            }

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    payBooking(id: number, s: number): any {
        const url = `${this.serverUrl}/bookings/pay`;
        return this.http.post<any>(url, {bookingId: id, totalPayment: s},{headers: this.getHeaderWithToken()})
            .pipe(
                catchError(this.handleError<string>('payBooking', 'failed'))
            );
    }
}
