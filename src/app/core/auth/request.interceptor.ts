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