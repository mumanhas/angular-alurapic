# Angular

Esse é um repositório para somente para estudo pessoal, seguindo o exercício proposto pelo curso de Angular da plataforma Alura, do grande professor Flávio Almeida.

A versões usadas no projeto:
Angular: 7.2.15 / Angular CLI: 7.2.4 / Node: 10.15.2


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


### Construtor 
Por convenção, é destinado à injeção de dependências.
Quando adicionamos o modificador private ou public no parâmetro do constructor da classe, o parâmetro se torna uma propriedade acessível à outros métodos da classe através do ```this```:
```
constructor(private http: HttpClient){}

metodoX() {
  return this.http
};
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


