import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lowerCaseValidator } from 'src/app/shared/validators/lower-case.validator';
import { UserNotTakenValidatorService } from './user-not-taken.validator.service';
import { NewUser } from './new-user';
import { SignUpService } from './signup.service';
import { Router } from '@angular/router';
import { PlataformDetectorService } from 'src/app/core/plataform-detector/plataform-detector.service';

@Component({
  templateUrl: './signup.component.html',
  providers: [ UserNotTakenValidatorService ]
})

export class SignupComponent implements OnInit {

  @ViewChild('emailInput') emailInput: ElementRef<HTMLInputElement>

  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userNotTakenValidatorService: UserNotTakenValidatorService,
    private signUpService: SignUpService,
    private router: Router,
    private platformDetectorService: PlataformDetectorService
  ){}

  ngOnInit(): void {
    this.platformDetectorService.isPlatformBrowser() && this.emailInput.nativeElement.focus();
    this.signupForm = this.formBuilder.group({
      email: ['', 
        [
          Validators.required, 
          Validators.email
        ]
      ],
      fullName: ['',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(40)
        ] 
      ],
      userName: ['',
        [
          Validators.required,
          lowerCaseValidator,
          Validators.minLength(2),
          Validators.maxLength(12)
        ],
        this.userNotTakenValidatorService.checkUserNameTaken()
      ],
      password: ['',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(14)
        ]
      ]
    });
  }

  signup() {
    const newUser = this.signupForm.getRawValue() as NewUser;
    this.signUpService
    .signup(newUser)
    .subscribe(
      () => this.router.navigate(['']),
      err => console.log(err)
    );
}

}