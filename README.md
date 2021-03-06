# Angular

Esse é um repositório para somente para estudo pessoal, seguindo o exercício proposto pelo curso de Angular da plataforma Alura, do grande professor Flávio Almeida.

A versões usadas no projeto:
Angular: 7.2.15 / Angular CLI: 7.2.4 / Node: 10.15.2

## Sumário
- [Bindings e Diretivas](#bindings-e-diretivas)
- [Decorators](#decorators)
- [Lifecycles](#lifecycles-hooks)
- [Observables](#observables)
- [Constructor](#constructor)
- [Pipes](#pipes)
- [Módulos](#módulos)
- [Serviços](#serviços)
- [Rotas](#rotas)
- [Forms e Validação](#forms-e-validação)
- [Autenticação](#autenticação) 
- [Build](#build)
- [Lazyloading e Codesplitting](#lazyloading-e-codesplitting)


## Bindings e Diretivas
- **Data Binding:** ```[propriedade]``` é one-way, ou seja, a informação vai do component.ts para a view;

- **Event Binding:** ```(click)``` também one-way, inverso, o evento vai da view para o component.ts;

- **Interpolation:** ```{{ propriety }}``` exibe o valor da propriedade em tempo real;

- **Inbound Property:** ```@Input()```  antes da propriedade, e conseguimos definir seu valor através de outro component (pai para o filho);

- **Output Property:** ```@Output()``` antes da propriedade, ela deve ser uma instância de EventEmmiter: ```@Output() onTyping = new EventEmitter<string>()```, assim, é possível a comunicação do component (filho para o pai);

- **ViewChild:** ```@ViewChild('userNameInput') userNameInput: ElementRef<HTMLInputElement>;``` é uma comunicação do pai com o elemento filho, através de uma variável de template ```<input #userNameInput```, assim o ElementRef funciona como um wrapper do elemento alvo do DOM.

- **If/Else:** ```*ngIf=" condicaoX; else Y ``` o conteúdo de else deve ficar entre a diretiva e ser nomeada usando uma variável de template: ```<ng-template #Y>```;

- **Content:** usamos a diretiva ```<ng-content>``` no template do nosso component para quando utilizar-lo em outro component, o contéudo declarado dentro do seu seletor apareça.

### Criando Diretivas
Toda diretiva, no seu estado bruto, é um component sem template. Vamos criar a diretiva **darken-on-hover.directive.ts**:
```
export class DarkenOnHoverDirective {

    @Input() brightness = '70%';

    constructor(
        private el: ElementRef,
        private render: Renderer
    ) {}

    @HostListener('mouseover')
    darkenOn() {
        this.render.setElementStyle(this.el.nativeElement, 'filter', `brightness(${this.brightness})`);
    }
    @HostListener('mouseleave')
    darkenOff() {
        this.render.setElementStyle(this.el.nativeElement, 'filter', 'brightness(100%)');
    }
}
```
Nesse caso, nossa diretiva custom está diminuindo o brilho do elemento em que o mouse passa, para isso usamos o **Render**, um módulo que nos permite manipular o DOM sem termos que digitar o que queremos fazer.
Observe também que nossa diretiva também pode receber uma **Inbound Property** onde ajustaremos o brilho diretamente no template em photos-list.component.html:
```
    <div *ngFor="let photo of cols" class="col-4" apDarkenOnHover brightness='80%'>
```

## Decorators
- **@HostListener** do pacote core. Passamos a ele o evento do elemento hospedeiro ao qual queremos responder, no qual a diretiva está sendo colocada: ```@HostListener('mouseover')```.

- **@Inject()** é um mecanismo geralmente utilizado no construtor de uma classe que permite especificar que o parâmetro inserido deve ser injetado.

## Lifecycles Hooks

**OnInit():** Usado na inicialização do component (tomar cuidado com a resposta de chamadas assíncronas);

**OnChanges():** Detectam mudanças nas inbound properties. Quando chamada pelo próprio framework, recebe como parâmetro uma instância de ```SimpleChanges```, um objeto do tipo SimpleChanges possui uma propriedade: photos, de mesmo nome da inbound property que sofreu mudança:
```
@Input() photos: Photo[] = [];

ngOnChanges(changes: SimpleChanges) {
    if(changes.photos)
        this.rows = this.groupColumns(this.photos);
}

```


## Observables
Os Observables vem do RxJS, são muito poderosos para operações assíncronas, por isso em Angular, por padrão, eles são usados no lugar das promisses. 
Como os Observables são lazy, eles precisam de um ```subscribe()``` para buscar os dados, como podemos ver no exemplo de requisição abaixo:
```
export class AppComponent {
  
  constructor(http: HttpClient){
    http.get<Object[]>('http://localhost:3000/flavio/photos')
    .subscribe(photos => this.photos = photos,
      err => console.log(err)
    );
  }

  photos: Object[] = [];

}
```

### Subject
O Subject é um tipo especial de **Observable**, é possível passar parametros, nesse exemplo usamos em conjunto o operador **debounceTime()**, no html: ```(keyup)="debounce.next($event.target.value)"``` e no component.ts:
```
export class PhotoListComponent implements OnInit {
...
  debounce: Subject<string> = new Subject<string>();

  constructor(private activatedRoute: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.photos = this.activatedRoute.snapshot.data.photos;
    this.debounce
    .pipe(debounceTime(300))
    .subscribe(filter => this.filter = filter);
...
```
Decaclarar a váriavel com ```$``` no final é boa prática para quando se usa um Observable.

### BehaviorSubject
O BehaviorSubject armazena a última emissão até que alguém apareça para consumi-la, ou seja, não corre o risco de emitir o valor enquanto quem vá consumi-lo o perca por ainda não estar carregado. Passamos por parametro o valor que vai emitir default:
```private userSubject = new BehaviorSubject<User>(null);```

## Constructor 
Por convenção, é destinado à injeção de dependências.
Quando adicionamos o modificador private ou public no parâmetro do constructor da classe, o parâmetro se torna uma propriedade acessível à outros métodos da classe através do ```this```:
```
constructor(private http: HttpClient){}

metodoX() {
  return this.http
};
```


## Pipes
Usamos os pipes para transformar dados. Há alguns pipes padrão como por exemplo o ```| uppercase```. Para criarmos um pipe, devemos criar uma classe com o **decorator @Pipe** implementando o metódo **transform()**, com determinada assinatura(parâmetro), criamos **filter-by-description.pipe.ts**:
```
@Pipe({ name: 'filterByDescription' })
export class FiltroPorTitulo implements PipeTransform {
  transform(photos: Photo[], descriptionQuery: string) {...}
}
```
Com o Async pipe conseguimos capturar a emissão do Observable diretamente do nosso template:
```<div *ngIf="(user$ | async) as user; else login">```


## Resolvers
São usados quando queremos resolver os dados assíncronos usados no component antes dele ser ativado, ou seja, durante a navegação daquela rota, **resolver.ts**:
```
@Injectable({ providedIn: 'root' })
export class PhotoListResolver implements Resolve<Observable<Photo[]>> {

  constructor(private service: PhotoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Photo[]> {
    const userName = route.params.userName;
    return this.service.listFromUser(userName);
  }

}
```
No **routing.module.ts**:
```
path: 'user/:userName',
component: PhotoListComponent,
resolve: { 
  photos: PhotoListResolver
} 
```

## Módulos
Usamos os módulos para agrupar componentes com um proprósito de funcionalidade, assim, nosso sistema se torna mais desacoplado, exemplo:

```
import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PhotoComponent } from './photo/photo.component';
import { PhotoListComponent } from './photo-list/photo-list.component';

@NgModule({
  declarations: [
    PhotoComponent, 
    PhotoListComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule
  ],
  exports: [
    PhotoListComponent
  ]
})

export class PhotosModule {}
```

No decorator ```@NgModule()``` declaramos as seguintes propriedades:
- **declarations**: array que declaramos todos os componentes que compõem nosso módulo.
- **imports**: somente módulos externos que são importados para que os componentes do nosso módulo possam importar-los e usar de suas propriedades. O **BrowserModule** contém uma série de diretivas do Angular entre outras coisas importantes de uso do navegador, como o BrowserModule só pode ser importada no ```app.module.ts```, nos demais módulos importamos o **CommonModule** ```import { CommonModule } from '@angular/common';```, que também contém as diretivas Angular.
- **exports**: array que declaramos os componentes que estarão acessíveis ao importarem nosso módulo (somente exportamos um component quando pretendemos usa-lo no template de um outro componente).

É importante lembrar que um Component só pode ser importado uma única vez, então o declaramos e importamos em um Módulo para que possar ser usados por outros.

## Serviços

Diferentemente de dos components, os serviços não precisam pertencer a um módulo. Usam o decorator @Injectable e no nosso exemplo, uma instância global já que seu **providedIn é root**.
No exemplo, nosso serviço identifica em qual plataforma está sendo executado o projeto(navegador: client-side ou server-side), através do **PLATFORM_ID, que é um InjectionTolken**:
```
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PlataformDetectorService {

  constructor(@Inject(PLATFORM_ID) private platformId: string) {}

  isPlatformBrowser() {
    return isPlatformBrowser(this.platformId)
  }
  
}
```

Quando um service é usado apenas num modulo e não desejamos que ele tenha escopo global, removemos o root do seu @Injectable: ```@Injectable()``` e no component que o service é usado, adicionaremos como provider:
```
@Component({
  templateUrl: './signup.component.html',
  providers: [ UserNotTakenValidatorService ]
})
``` 
E no módulo temos que que adicionar o serviço como provider também:
```
imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VMessageModule,
    RouterModule,
    HomeRoutingModule
],
providers: [
    SignUpService
]
````

### Intereceptors
Um interceptor nos permite de forma bem simples interceptar e configurar requisições antes delas serem disparadas para o servidor.
Criamos um interceptor **request.interceptor.ts** responsável por guardar o token da autenticação e envia-lo em toda requisição para o back-end:
```
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { TokenService } from '../token/token.service';
import { Injectable } from '@angular/core';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler):import("rxjs").Observable<HttpEvent<any>> {

      if(this.tokenService.hasToken()) {
        const token = this.tokenService.getToken();
        req = req.clone({
          setHeaders: {
            'x-access-token': token
          }
        })
      }
      
      return next.handle(req);
  }
}
```

e no **core.module.ts** adicionaremos como provider:
```
import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './auth/request.interceptor';

@NgModule({
  declarations: [HeaderComponent],
  exports: [HeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    }
  ]
})

export class CoreModule {}
```

## Rotas

Existem duas formas de redirecionar o usuário para rotas da nossa aplicação:
Concatenando:```this.router.navigateByUrl('user/' + userName)```;
Parametrizando:```this.router.navigate(['user', userName])```;

A diretiva **routerLink]="['']"** é o modo correto de redirecionar para uma rota, quando usando ```<a>``` a página é regarregada, perdendo todo o poder de uma SPA.

### RountingModule
Responsável pela controle de rotas de nossa aplicação. Ao perceber que a uma rota com o pathname já definido foi chamada, o Angular intercepta essa chamada, direcionando para o respectivo componente, sem que ocorra uma requisição para o backend, exemplo:
```
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 

import { PhotoListComponent } from './photos/photo-list/photo-list.component';
import { PhotoFormComponent } from './photos/photo-form/photo-form.component';


const routes: Routes = [
  { path: 'user/flavio', component: PhotoListComponent },
  { path: 'p/add', component: PhotoFormComponent },
  { path: '**', component: NotFoundComponent }

]

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes) 
  ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
```
Note que importamos RouterModule usando o método **forRoot(routes)**, o que significa, o que ele pegará a rota raiz (no caso localhost:4200/) e linkara com a variável routes que contém a lista de rotas.

Também declaramos ```exports: [ RouterModule ]``` para que quem importe o **AppRoutingModule** já tenha **RouterModule** disponível e não precise importa-lo também.

No exemplo, usamos ```path: '**', component: NotFoundComponent``` para definir que qualquer outra rota que não esteja declarada no array Routes caia numa página de erro.

Podemos definir uma rota parametrizada: ```{ path: 'user/:userName', component: PhotoListComponent }```.
No serviço **PhotoService**: 
```   
listFromUser(userName){
  return this.http.
  get<Photo[]>(API + '/' + userName + '/photos')
}
```
E agora no componente **PhotoListComponent** que chama o serviço, adiconamos uma propriedade privada: ```activatedRoute: ActivatedRoute``` e no ngOnInit definimos a variável que armazenará a "foto" do pathname: ```const userName = this.activatedRoute.snapshot.params.userName``` 
```
...
  constructor(
    private photoService: PhotoService,
    private activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    const userName = this.activatedRoute.snapshot.params.userName;

    this.photoService.listFromUser(userName)
    .subscribe(photos => {
      this.photos = photos;
      console.log(photos[0].description)
    })

  }
...
````

A tag ```<router-outlet>``` é a resposável por exibir os componentes de acordo com o rota solicitada.

### Rotas Filhas
Quando criamos um component filho e queremos criar rotas de outros components que pertencem a esse módulo filho, criamos um outro arquivo de rotas: **filho-routing.module.ts**

Nele importamos o ```imports: [RouterModule.forChild(routes)]```no lugar do ```forChild(routes)```:
```
const routes: Routes = [
  
  {
    path: 'avo',
    component: AvoComponent,
  },
  {
    path: 'avo/pai',
    component: PaiComponent,
  },
  {
    path: 'avo/pai/filho',
    component: FilhoComponent,
  }
```
Podemos também declarar rotas filhas usando **children** e declarar a diretiva **<router-outlet>** dentro de **AvoComponent.html**, assims os dois components são renderizados. Nosso filho-routing.module.ts ficaria assim:
```
  const routes: Routes = [
  
    {path: 'avo', component: AvoComponent, children: [
      {path: '/pai', component: PaiComponent},
      {path: '/pai/filho', component: FilhoComponent}
    ]}
  ];
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
 ```

 ### Guardas de Rotas 

Criando ```auth.guard.ts```, importaremos a interface CanActivate:
```
@Injectable({ providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor (
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
      if(this.userService.isLogged()){
        this.router.navigate(['user', this.userService.getUserName()]);
        return false;
      }
      return true;
  }
}
```
No arquivo de rotas colocamos nosso guard:
```
...
const routes: Routes = [
  {
    path: '',
    component: SigninComponent,
    canActivate: [AuthGuard]
  },
...
```

## Forms e Validação

 Para validação podemos utilizar o **Model Driven Forms**, cuja regra de validação ficará no componente, e não no template. Para isso, vamos importar o **ReactiveFormsModule** do @angular/forms.
 No component, criamos uma propriedade loginForm, do tipo **FormGroup** que será usada no template para identificar o formulário.
 Também usamos o **FormBuilder**, responsável por criar a abstração do nosso form junto com seus inputs através do método ```.group```. No array dos inputs, passamos o valor inicial do input e usamos o **Validators** para a validação obrigatória: ```userName: ['', Validators.required]```, no signin.component.ts:
 ```
@Component({
  templateUrl: './signin.component.html'
})

export class SigninComponent {

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
        userName: ['', Validators.required],
        password: ['', Validators.required]
    });
}
````
Já no nosso template, podemos ver o uso da diretiva ```[formGroup]```, identificando nosso formulário.
Também temos propriedade ```formControlName="userName"``` que identifica os inputs conforme nosso formBuilder.group do component.
Detalhe para o uso do **Safe Operator**: ```*ngIf="loginForm.get('userName').errors?.required"```, onde ele verifica a existencia de ```.errors?``` antes de prosseguir. Nosso signin.component.html:
```
<h4 class="text-center">Login</h4>

<form [formGroup]="loginForm" class="form mt-4">

    <div class="form-group">
        <input
        formControlName="userName"
        class="form-control"
        placeholder="user name"
        autofocus>
        <small
            *ngIf="loginForm.get('userName').errors?.required"
            class="text-danger d-block mt-2">
            User name is required!
        </small>
    </div>
...
```
 
 Por último, usamos a diretiva ```[disabled]``` para quando houver o descumprimento de uma regra do Validators:
 ```
 <button [disabled]="loginForm.invalid" type="submit" class="btn btn-primary btn-block">login</button>
 ```

 A classe **FormGroup** disponibiliza uma série de funcionalidades, os principais métodos:

- ```setValue(value: {...}, options: {...}): void``` (Setar os valores do formulário através de um objeto.)

- ```contains(controlName: string): boolean``` (Verificar se o formulário tem um determinado campo através do respectivo controlName).

- ```getRawValue()```(Obter um objeto com os valores do fomrlário)

 ### Validadores Custom
 Para criar um validador custom, criamos na pasta **shared** o ```lower-case.validator.ts```, que é uma função que sempre recebe como parâmetro ```control: AbstractControl```:
 ```
import { AbstractControl } from '@angular/forms';

export function lowerCaseValidator(control: AbstractControl) {

  if(control.value.trim() && !/ˆ[a-z0-9_\-]+$/.test(control.value)){
    return { lowerCase: true }
  }
  return null
}
```
Depois, no ```signup.component.ts``` podemos adiciona-lo à validação:
```
...
export class SignupComponent implements OnInit {

  signupForm: FormGroup;

  constructor(private formBuilder: FormBuilder){}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      userName: ['',
        [
          Validators.required,
          lowerCaseValidator,
          Validators.minLength(2),
          Validators.maxLength(30)
        ]
      ],
    ...
 ```
 E finalmente chamar no template do signup.component.html:
 ```
 ...
     <div class="form-group">
        <input 
        formControlName="userName"
        placeholder="user name" 
        class="form-control">
        <ap-vmessage
            *ngIf="signupForm.get('userName').errors?.lowerCase"
            text="Must be lowercase!">
        </ap-vmessage>
    </div>
...
```

###Validadores Assíncronos
Criando um validador assincrono que valida se o userName já é cadastrado:
```
import { Injectable } from '@angular/core';
import { SignUpService } from './signup.service';
import { AbstractControl } from '@angular/forms';
import { debounceTime, switchMap, map, first } from 'rxjs/operators';

@Injectable ( { providedIn: 'root' })
export class UserNotTakerValidatorService {

  constructor(private signUpService: SignUpService) {}

  checkUserNameTaken() {
    return (control: AbstractControl) => {

      return control
        .valueChanges
        .pipe(debounceTime(300))
        .pipe(switchMap(userName =>
          this.signUpService.checkUserNameTaken(userName)
        ))
        .pipe(map(isTaken => isTaken ? { userNameTaken: true } : null))
        .pipe(first());    
    }
  }

}
```
No ```signup.component.ts``` ele entra como terceiro elemento do array do Validators:
```
...
  userName: ['',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      //lowerCaseValidator
    ],
    this.userNotTakenValidatorService.checkUserNameTaken()
  ],
...
```

E por fim é importante declarar o **.peding** no botão enviar do template:
```<button [disabled]="signupForm.invalid || signupForm.pending">Enviar</button>```

## Autenticação

Uma forma de obter o token retornado pelo backend é passando um terceiro parametro para o post: ```{ observe: 'response'} ``` e usar o pipe e o tap (um operador do rxjs) para trabalhar com  resposta, assim nosso **auth.service.ts** fica:
```
return this.http
    .post(
        API_URL + '/user/login', 
        { userName, password }, 
        { observe: 'response'} 
    )
    .pipe(tap(res => {
        const authToken = res.headers.get('x-access-token')
        console.log(`User ${userName} authenticated with token ${authToken}`);
    }));
```

Podemos armazenar o token no LocalStorage do navegador, para isso criaremos o serviço **token.service.ts**:
```
import { Injectable } from '@angular/core';

const KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class TokenService {

    hasToken() {
        return this.getToken();
    }

    setToken(token) {
        window.localStorage.setItem(KEY, token);
    }

    getToken() {
        return window.localStorage.getItem(KEY);
    }

    removeToken() {
        window.localStorage.removeItem(KEY);
    }
}
```

E usaremos o método setToken quando o usuário logar, no **auth.service.ts**.

No projeto para seguranca do token foi usado o JWT (Json Web Token).
```npm install jwt-decode@2.2.0``` é módulo auxiliará neste processo de captura do valor localizado no Payload do JWT.

## Build

Ao exercutar o comando ```ng build --prod``` no terminal, o Angular se encarrega de aplicar
várias técnicas de otimização para gerar o projeto, os artefatos estarão dentro da pasta **/dist**.

Um fato a ser levado em conta quando configuramos as rotas da aplicação é que o Angular utiliza o que chamamos de HTML5 mode, o **History API** do navegador, para que seja possível trabalhar com URLs sem a necessidade do #. 
Uma vez que o hash não dispara o carregamento na mudança do location, no back end, o Angular o intercepta e extrai a informação, detectando qual component deve ser carregado. 
O back end cujo Angular é hospedado precisa estar programado para que qualquer requisição feita para ele devolva index.html, caso isso não seja feito, é preciso configurarmos as rotas com hashtag: no arquivo de rotas **app.rounting.module.ts**:
```
@NgModule({
  imports: [
      RouterModule.forRoot(routes, { useHash: true } )
  ],
  exports: [ RouterModule ]
})
```

## Lazyloading e Codesplitting

Após o build do projeto, um dos artefatos gerados é o **main**, nele estão todos nossos componentes. Ao carregar a página, o usuário terá que fazer o download disso tudo, e, é uma boa prática dividirmos em partes**(chunks)** para que se faça o download conforme a demanda, essa é uma tecnica conhecida como **Code splitting**.
O lazyloading é fazermos com que essas partes do módulo sejam carregados apenas quando o usuário acessar as rotas em que são usados.
Aplicando o Lazy Loading no HomeComponent, a propriedade ```pathMatch: 'full'``` é adicionada, se não, qualquer rota que começar com ```/``` será considerada e o **loadChildren** indica o módulo que sera carregado sob demanda (#HomeModule é o nome colocado em  home.module.ts), nosso app.routing.module.ts fica assim:
```
...
const routes: Routes = [
  {
      path: '',
      pathMatch: 'full',
      redirectTo: 'home'
  },
  {
      path: 'home',
      loadChildren: './home/home.module#HomeModule'
  },
...
```

 Criamos o **home.routing.module.ts**, que é o responsável pelo gerenciamento de rotas:
```
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { HomeComponent } from './home.component';
import { AuthGuard } from '../core/auth/auth.guard';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: SigninComponent,
      },
      {
        path: 'signup',
        component: SignupComponent
      },
    ] 
  }
]

@NgModule({
  imports: [ 
    RouterModule.forChild(routes) 
  ],
  exports: [ RouterModule ]
})

export class HomeRoutingModule {}
```

Devemos usar o ```RouterModule.forChild```no momento em que formos compilar as rotas para dentro do módulo.
Note que trazemos todos os imports dos Components pertinentes e removemos de app.routing.module.ts.
Outro ponto importante é que, se queremos carregar um módulo preguiçosamente, **ele não pode ser importado em app.module.ts**




