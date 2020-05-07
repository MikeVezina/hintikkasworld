import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';
import {ExampleDescription} from '../environment/exampledescription';
import {CustomDescription} from "../environment/CustomDescription";
import {EpistemicModel} from "../epistemicmodel/epistemic-model";
import {WorldValuation} from "../epistemicmodel/world-valuation";
import {Valuation} from "../epistemicmodel/valuation";
import {RefreshAction} from "../environment/refresh-action";


export class ConfigService {
    constructor() {
    }
}


const HOST = 'localhost:9090';

@Injectable()
export class RemoteDescription extends ExampleDescription {
    getCurrentModel(): EpistemicModel {
        return this.remoteModel;
    }

    getDescription(): string[] {
        return ['Three agents are each assigned two cards. Agents can only see the cards of other agents, and must use announcements to determine which cards they have. '];
    }

    remoteDesc: CustomDescription;
    remoteModel: ExplicitEpistemicModel;
    isLoaded: boolean;

    constructor(private http: HttpClient) {
        super();
        this.isLoaded = false;
        this.getModel().then(() => this.isLoaded = true);
    }

    private async getModel(): Promise<any> {
        let obsResp: any = await this.http.get("http://localhost:9090/api/model", {headers: {"Accept": "application/json"},}).toPromise();
        if (obsResp.error)
            return Promise.reject(obsResp.error);
        else {
            this.remoteModel = await this.createModel(obsResp.model);
            this.remoteDesc = await this.createDescription(obsResp.description);
        }

        return Promise.resolve();
    }

    private async createDescription(description): Promise<CustomDescription> {
        return new CustomDescription(description.rawData);
    }

    private async createModel(raw: any): Promise<ExplicitEpistemicModel> {
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


        return E;
    }

    getAtomicPropositions(): string[] {
        if (!this.isLoaded) {
            this.getModel();
            return [];
        }

        return this.remoteDesc.getAtomicPropositions()
    }

    getName() {
        return 'Remote Model';
    }

    getInitialEpistemicModel() {
        if (!this.isLoaded) {
            this.getModel();
            return;
        }

        return this.remoteDesc.getInitialEpistemicModel();
    }

    getActions() {
        if (!this.isLoaded) {
            this.getModel();
            return [];
        }

        let refreshAction = new RefreshAction(async () => {
            await this.getModel();
        });

        let actions = this.remoteDesc.getActions() || [];

        actions.push(refreshAction);

        return actions;

    }


}
