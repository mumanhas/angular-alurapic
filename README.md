# Angular

Esse é um repositório para somente para estudo pessoal, seguindo o exercício proposto pelo curso de Angular da plataforma Alura, do grande professor Flávio Almeida.

A versões usadas no projeto:
Angular: 7.2.15 / Angular CLI: 7.2.4 / Node: 10.15.2

## Sumário
- [Bindings e Diretivas](#bindings-e-diretivas)
- [Lifecycles](#lifecycles-hooks)
- [Observables](#observables)
- [Constructor](#constructor)
- [Pipes](#pipes)
- [Módulos](#módulos)
- [Rotas](#rotas)


## Bindings e Diretivas
Data Binding: ```[propriedade]``` é one-way, ou seja, a informação vai do component.ts para a view;

Event Binding: ```(click)``` também one-way, inverso, o evento vai da view para o component.ts;

Interpolation: ```{{ propriety }}``` exibe o valor da propriedade em tempo real;


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


### Constructor 
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
No decorator ```@NgModule()``` declaramosas seguintes propriedades:
- **declarations**: array que declaramos todos os componentes que compõem nosso módulo.
- **imports**: módulos externos que são importados para que os componentes do nosso módulo possam importar-los e usar de suas propriedades. O **BrowserModule** contém uma série de diretivas do Angular entre outras coisas importantes de uso do navegador, como o BrowserModule só pode ser importada no ```app.module.ts```, nos demais módulos importamos o **CommonModule** ```import { CommonModule } from '@angular/common';```, que também contém as diretivas Angular.
- **exports**: array que declaramos os componentes que estarão acessíveis ao importarem nosso módulo.

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

