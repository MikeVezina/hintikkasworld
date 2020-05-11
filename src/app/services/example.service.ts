import { Injectable } from '@angular/core';
import { ExampleDescription } from '../modules/core/models/environment/exampledescription';
import {RemoteDescription} from "../modules/core/models/examples/remote-description";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

/** this service is to give the correct exampledescription from menu to core. */
export class ExampleService {

  private exampleDescription: ExampleDescription = new RemoteDescription();
  //by default, the loaded example is .... :)

  setExampleDescription(exampleDescription: ExampleDescription) {
    this.exampleDescription = exampleDescription;
  }

  getExampleDescription() {
    return this.exampleDescription;
  }

  constructor(private http: HttpClient) { }
}
