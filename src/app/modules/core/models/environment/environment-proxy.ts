import {Action} from './action';
import {ExampleDescription} from './exampledescription';
import {EpistemicModel} from '../epistemicmodel/epistemic-model';
import {Environment} from "./environment";
import {ExplicitEpistemicModel} from "../epistemicmodel/explicit-epistemic-model";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CustomDescription} from "./CustomDescription";
import {Valuation} from "../epistemicmodel/valuation";
import {WorldValuation} from "../epistemicmodel/world-valuation";
import {RefreshAction} from "./refresh-action";
import {RemoteDescription} from "../examples/remote-description";


export class EnvironmentProxy extends Environment {
    private remoteDesc: RemoteDescription;
    private remoteModel: ExplicitEpistemicModel;
    private bsEnv: BehaviorSubject<Environment>;

    constructor(exampleDescription: ExampleDescription, private http: HttpClient) {
        super(exampleDescription);
        this.reset();
    }

    private async getModel({needsDesc}={needsDesc: false}) {
        if (!this.http)
            return;

        console.log("Requesting epistemic model");

        let requestOptions = {
            headers: {"Accept": "application/json"},
            params: {description: '' + needsDesc}
        };

        let obsResp: any = await this.http
            .get("http://localhost:9090/api/model", requestOptions)
            .toPromise()
            .catch((err) => {
                console.error("Failed to get epistemic model: " + err);
                throw err;
            });

        if (obsResp.error)
            throw obsResp.error;

        this.remoteModel = await createModel(obsResp.model);


        if (needsDesc && this.remoteDesc) {
            let remoteDesc = await createDescription(obsResp.description);
            this.remoteDesc.setDescription(remoteDesc);
        }

        // Trigger subscribers (i.e. ui redraw)
        if (this.bsEnv)
            this.bsEnv.next(this);

    }


    setBehaviourSubject(bsEnv: BehaviorSubject<Environment>) {
        this.bsEnv = bsEnv;
    }

    getEpistemicModel(): EpistemicModel {
        if (!this.remoteDesc)
            return super.getEpistemicModel();

        return this.remoteModel || new ExplicitEpistemicModel();
    }

    setEpistemicModel(M: EpistemicModel) {
        if (!this.remoteDesc)
            return super.setEpistemicModel(M);
    }

    getExampleDescription(): ExampleDescription {
        return super.getExampleDescription();
    }

    getActions(): Action[] {
        if (this.remoteDesc) {
            let refreshAction = new RefreshAction(() => {

                // Trigger async model refresh
                this.getModel();
            });

            // Clone description actions
            let actions = Array.from(this.remoteDesc.getActions()) || [];

            // Add refresh action
            actions.push(refreshAction);


            return actions;
        }

        return super.getActions();
    }


    async computeExecutableActions(): Promise<Action[]> {
        super.setExecutableActions(this.getActions());
        return super.getExecutableActions();
    }

    perform(action: Action) {
        return super.perform(action);
    }

    reset() {
        // Remote Description should be set if we are dealing with a remote description
        if (super.getExampleDescription() instanceof RemoteDescription) {
            this.remoteDesc = <RemoteDescription>super.getExampleDescription();
            this.getModel({needsDesc: true});
        }

        super.reset();

    }


}

async function createDescription(description): Promise<CustomDescription> {
    return new CustomDescription(description.rawData);
}

async function createModel(raw: any): Promise<ExplicitEpistemicModel> {
    let E = new ExplicitEpistemicModel();

    let nodes = raw.nodes || {};

    // Right now, this is hard coded to only support world valuations
    for (let worldName of Object.keys(nodes)) {
        let nodeData = nodes[worldName] || {};
        let valuationData = nodeData.valuation || {};
        let valuationObj = new Valuation(valuationData.propositions || {});

        E.addWorld(worldName, new WorldValuation(valuationObj));
    }

    let successors = raw.successors || {};

// Right now, this is hard coded to only support world valuations
    for (let agent of Object.keys(successors)) {
        let sourceWorlds = successors[agent] || {};
        for (let src of Object.keys(sourceWorlds)) {
            let destinations: string[] = sourceWorlds[src] || [];

            for (let dest of destinations) {
                E.addEdge(agent, src, dest);
            }
        }
    }

    E.setPointedWorld(raw.pointed);

    return E;
}
