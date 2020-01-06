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
- [Rotas](#rotas)
- [Forms e Validação](#forms)


## Bindings e Diretivas
- **Data Binding:** ```[propriedade]``` é one-way, ou seja, a informação vai do component.ts para a view;

- **Event Binding:** ```(click)``` também one-way, inverso, o evento vai da view para o component.ts;

- **Interpolation:** ```{{ propriety }}``` exibe o valor da propriedade em tempo real;

- **Inbound Property:** ```@Input()```  antes da propriedade, e conseguimos definir seu valor através de outro component (pai para o filho);

- **Output Property:** ```@Output()``` antes da propriedade, ela deve ser uma instância de EventEmmiter: ```@Output() onTyping = new EventEmitter<string>()```, assim, é possível a comunicação do component (filho para o pai);

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

## Rotas

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
 

