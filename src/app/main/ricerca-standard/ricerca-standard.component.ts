import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {City} from '../interfaceDB/city';
import {BehaviorSubject, merge, Observable, of} from 'rxjs';
import {SpringService} from '../spring.service';
import {Room} from '../interfaceDB/room';
import {fuseAnimations} from '../../../@fuse/animations';
import {DataSource} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {map} from 'rxjs/operators';


export interface StateGroup {
    letter: string;
    names: string[];
}


@Component({
    selector: 'ricerca_standard',
    templateUrl: './ricerca-standard.component.html',
    styleUrls: ['./ricerca-standard.component.scss'],
    animations   : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RicercaStandardComponent implements OnInit {
    form: FormGroup;
    cities: City[] = [{name: 'United States of America'}, {name: 'China'}]; // ...
    stateGroupOptions: Observable<StateGroup[]>;
    returnList: StateGroup[] = [];
    onProductChanged: BehaviorSubject<any>;
    roomList: Room[] = [];
    dataSource: FilesDataSource | null;
    displayedColumns = ['id', 'image', 'hotel_name', 'price', 'numPlaces', 'hotel_stars'];

    @ViewChild(MatPaginator, {static: true})
    paginator: MatPaginator;

    @ViewChild(MatSort, {static: true})
    sort: MatSort;

    /*@ViewChild('filter', {static: true})
    filter: ElementRef;*/

    constructor(
        private _formBuilder: FormBuilder,
        private springService: SpringService,
    ) {
        this.stateGroupOptions = this.sortCity();
        this.onProductChanged = new BehaviorSubject({});
    }

    ngOnInit(): void {
        this.dataSource = new FilesDataSource(this, this.paginator, this.sort);
        this.form = this._formBuilder.group({
            city: ['', Validators.required],
            personNumber: ['', [Validators.required, Validators.pattern('^[0-9]')]],
            arrival: ['', Validators.required],
            departure: ['', Validators.required]
        });
    }

    sortCity(): Observable<StateGroup[]> {
        this.cities.sort((one, two) => (one.name > two.name ? 1 : -1));
        let thisLetter = 'A';
        let citySameLetter: string[] = [];
        for (const c of this.cities) {
            const city = c.name;
            if (city[0].toUpperCase() !== thisLetter) {
                if (citySameLetter.length > 0) {
                    this.returnList.push({letter: thisLetter, names: citySameLetter});
                    citySameLetter = [];
                }
                thisLetter = city[0].toUpperCase();
            }
            citySameLetter.push(city);
        }
        this.returnList.push({letter: thisLetter, names: citySameLetter});
        return of(this.returnList);
    }

    // PROBLEMI: prende le città anche se non fan parte della lista
    onFormSubmit(): void {
        // alert(JSON.stringify(this.form.value));
        console.log(this.form.get('arrival').value);

        const date = this.parse(this.form.get('arrival').value);
        const finalDate = date.getDate() + '/' + (1 + date.getMonth())  + '/' + date.getFullYear();
        this.form.get('arrival').setValue(finalDate);
        console.log(this.form.get('arrival').value);


        const date2 = this.parse(this.form.get('departure').value);
        const finalDate2 = date2.getDate() + '/' + (1 + date2.getMonth())  + '/' + date2.getFullYear();
        this.form.get('departure').setValue(finalDate2);
        console.log(this.form.get('departure').value);


        this.springService.normalSearch(this.form.value)
            .subscribe(
                mappa => { // sarebbe da controlalre se mappa.get('resultcode') va bene
                    this.roomList = mappa['returnedValue'];
                    this.onProductChanged.next(this.roomList);
                }
                );
    }

    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            const year = Number(str[2]);
            const month = Number(str[1]) - 1;
            const date = Number(str[0]);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }
}

export class FilesDataSource extends DataSource<any>
{
    // private _filterChange = new BehaviorSubject('');  // tutto ciò relativo a filter può servire, non cancellare
    private _filteredDataChange = new BehaviorSubject('');

    /**
     * Constructor
     *
     * @param {MatPaginator} _matPaginator
     * @param {MatSort} _matSort
     */
    constructor(
        private _observableList: RicercaStandardComponent,
        private _matPaginator: MatPaginator,
        private _matSort: MatSort
    )
    {
        super();

        this.filteredData = this._observableList.roomList;
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this._observableList.onProductChanged,
            this._matPaginator.page,
            this._matSort.sortChange
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                        let data = this._observableList.roomList.slice();

                        // data = this.filterData(data);

                        // this.filteredData = [...data];

                        data = this.sortData(data);

                        // Grab the page's slice of data.
                        const startIndex = this._matPaginator.pageIndex * this._matPaginator.pageSize;
                        return data.splice(startIndex, this._matPaginator.pageSize);
                    }
                ));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Filtered data
    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    // Filter
    /*get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }*/

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /* Filter data
     *
     * @param data
     * @returns {any}
     *
    filterData(data): any
    {
        if ( !this.filter )
        {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }*/

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[]
    {
        if ( !this._matSort.active || this._matSort.direction === '' )
        {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch ( this._matSort.active )
            {
                case 'id':
                    [propertyA, propertyB] = [a.id, b.id];
                    break;
                case 'hotel_name':
                    [propertyA, propertyB] = [a.hotel.name, b.hotel.name];
                    break;
                case 'price':
                    [propertyA, propertyB] = [a.pricePerNight, b.pricePerNight];
                    break;
                case 'numPlaces':
                    [propertyA, propertyB] = [a.numPlaces, b.numPlaces];
                    break;
                case 'hotel_stars':
                    [propertyA, propertyB] = [a.hotel.stars, b.hotel.stars];
                    break;
            }
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    /**
     * Disconnect
     */
    disconnect(): void
    {
    }
}