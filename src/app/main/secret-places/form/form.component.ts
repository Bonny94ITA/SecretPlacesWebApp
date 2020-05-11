import {Component, OnInit} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup, ValidationErrors, ValidatorFn,
    Validators
} from '@angular/forms';
import {City} from '../../interfaceDB/city';
import {Observable, of} from 'rxjs';
import {SpringService} from '../../spring.service';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {CityService, CityValidator, REGIONS, StateGroup} from '../../city.service';



@Component({
    selector: 'form-secret-places',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
    starOne: string[] = ['1', '2', '3', '4', '5'];
    starTwo: string[] = ['1', '2', '3', '4', '5'];
    tourismTypes: string[] = ['balneare', 'montano', 'lacustre', 'naturalistico', 'culturale', 'termale', 'religioso', 'sportivo', 'enogastronomico'];
    regions = REGIONS;
    form: FormGroup;
    stateGroupOptions: Observable<StateGroup[]>;


    /**
     * Constructor
     *
     * @param {CityService} _cityService
     * @param {FormBuilder} _formBuilder
     * @param {SpringService} _springService
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _springService: SpringService,
        private _cityService: CityService
    ) {
    }


    ngOnInit(): void {
        this.form = this._formBuilder.group({
            cities: this._formBuilder.array([], ),
            maxBudget: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})*'), Validators.min(0.01)]],
            people: ['', [Validators.required, Validators.pattern('^[0-9]'), Validators.min(1)]],
            onlyRegion: [''],
            onlyNotRegion: [''],
            minStars: [1],
            maxStars: [5],
            tourismTypes: this._formBuilder.array([]),
            arr: ['', Validators.required],
            arrival: [''],
            dep: ['', Validators.required],
            departure: ['']
        });
        this.stateGroupOptions = this._cityService.getSortedCity();
        this.form.controls['arr'].valueChanges.subscribe(arr => {
            this.setFinalDate('arrival', arr);
        });
        this.form.controls['dep'].valueChanges.subscribe(dep => {
            this.setFinalDate('departure', dep);
        });
    }

    get cities(): FormArray {
        return this.form.get('cities') as FormArray;
    }

    removeCity(i): void {
        this.cities.removeAt(i);
    }

    private setFinalDate(param: string, value: any): void {
        const date = this.parse(value);
        const finalDate = date.getDate() + '/' + (1 + date.getMonth()) + '/' + date.getFullYear();
        this.form.controls[param].setValue(finalDate);
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Finish the vertical stepper
     */
    finishVerticalStepper(): void {
        this._springService.searchClips(this.form.value)
         .subscribe(alternative => console.log(JSON.stringify(alternative)));
    }

    onCheckChange(event: MatCheckboxChange): void {

        const formArray: FormArray = this.form.get('tourismTypes') as FormArray;

        if (event.checked) {
            formArray.push(new FormControl(event.source.value));
        } else {
            let i = 0;
            formArray.controls.forEach((ctrl: FormControl) => {
                if (ctrl.value === event.source.value) {
                    // Remove the unselected element from the arrayForm
                    formArray.removeAt(i);
                    return;
                }
                i++;
            });
        }
    }

    addInput(input: HTMLInputElement): void {
        const value: string = input.value;
        if ( value === ''){ return; }
        const newCity =  this._formBuilder.group({
            name: [value, { validators: [CityValidator.checkCity(this._cityService)], updateOn: 'blur'}],
            region: [this._cityService.getRegion(value)],
        });
        this.cities.push(newCity);
        input.value = '';
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
