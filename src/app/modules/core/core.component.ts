import { EventModelAction } from './models/environment/event-model-action';
import { Action } from './models/environment/action';
import { MuddyChildren } from './models/examples/muddy-children';
import { environment } from './../../../environments/environment';

import { Location } from '@angular/common';
import { ExampleService } from './../../services/example.service';
import { Environment } from './models/environment/environment';
import {Component, OnInit, Input, Injectable} from '@angular/core';
import { ExampleDescription } from './models/environment/exampledescription';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormulaFactory, Formula } from './models/formula/formula';
import { ExplicitEventModel } from './models/eventmodel/explicit-event-model';
import { SymbolicPublicAnnouncement } from './models/eventmodel/symbolic-public-announcement';
import { SymbolicEpistemicModel } from './models/epistemicmodel/symbolic-epistemic-model';
import {EnvironmentProxy} from "./models/environment/environment-proxy";
import {HttpClient} from "@angular/common/http";




@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})
@Injectable()
export class CoreComponent implements OnInit {

  bsEnv: BehaviorSubject<Environment>;
  constructor(private exampleService: ExampleService, private location: Location, private http: HttpClient) { }

  ngOnInit() {
    let exampleDescription = this.exampleService.getExampleDescription();
    let env: EnvironmentProxy;
	  try {
      env = new EnvironmentProxy(exampleDescription, this.http);
    }
    catch (error) {
      let err = <Error>error;
      console.error(err.name, err.message);
      console.error(err.stack);
      console.log("Error: so we load MuddyChildren!");
      exampleDescription = new MuddyChildren(2);

      env = new EnvironmentProxy(exampleDescription, this.http);
    }
    this.bsEnv = new BehaviorSubject(env);
	  env.setBehaviourSubject(this.bsEnv);

    this.bsEnv.subscribe(env => this.initModelChecking());

  }


  isEpistemicModelReady() : boolean {
    return this.bsEnv.value.getEpistemicModel().isLoaded();
  }


  getFormulaGUI(): Formula {
    return FormulaFactory.createFormula(<string>$("#formula").val());
  }

  async modelChecking(): Promise<boolean> {
    try {
      let result = await this.bsEnv.value.getEpistemicModel().check(this.getFormulaGUI());
      $('#modelCheckingButtonImage').attr("src", result ? "assets/img/ok.png" : "assets/img/notok.png");
      return result;
    }
    catch (error) {
      $("#error").html(error);
    }
  }

  initModelChecking() {
    $('#modelCheckingButtonImage').attr("src", "assets/img/mc.png");
    $("#error").html("");
  }


  async performPublicAnnouncement() {
    if (!await this.modelChecking()) return;



    this.bsEnv.value.perform(new EventModelAction({
      name: "public announcement",
      eventModel:
        this.bsEnv.value.getEpistemicModel() instanceof SymbolicEpistemicModel ?
          new SymbolicPublicAnnouncement(this.getFormulaGUI())
          : ExplicitEventModel.getEventModelPublicAnnouncement(this.getFormulaGUI())
    }));
    this.bsEnv.next(this.bsEnv.value);
  }


  perform(action: Action) {
    console.log(action)
    this.bsEnv.value.perform(action);
    this.bsEnv.next(this.bsEnv.value);
  }


  reset() {
    this.bsEnv.value.reset();
    this.bsEnv.next(this.bsEnv.value);
  }

  chooseAnotherExample(): void {
    this.location.back();	
  }
  setInternalPerspective(a: string) {
    this.bsEnv.value.agentPerspective = a;
    this.bsEnv.next(this.bsEnv.value);
  }

  setExternalPerspective() {
    this.bsEnv.value.agentPerspective = undefined;
    this.bsEnv.next(this.bsEnv.value);
  }

  getAgents(): string[] {
    return this.bsEnv.value.getEpistemicModel().getAgents();
  }


  getAtomicPropositions(): string[] {
    return this.bsEnv.value.getExampleDescription().getAtomicPropositions();
  }

  getDescription(): string[] {
    try {
      return this.bsEnv.value.getExampleDescription().getDescription();
    }
    catch(e) {
      console.log(e)
      return []
    }
  }

  showHelp() {
    window.open("assets/about.html", "_target");
  }
}
