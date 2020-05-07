import {Action} from './action';
import {ExampleDescription} from './exampledescription';
import {EpistemicModel} from '../epistemicmodel/epistemic-model';
import {Environment} from "./environment";
import {RemoteDescription} from "../examples/remote";
import {ExplicitEpistemicModel} from "../epistemicmodel/explicit-epistemic-model";


export class EnvironmentProxy extends Environment {
    private readonly isRemote: boolean;

    constructor(exampleDescription: ExampleDescription) {
        super(exampleDescription);
        // Remote Description should be given full control
        this.isRemote = exampleDescription instanceof RemoteDescription;
    }

    getEpistemicModel(): EpistemicModel {
        if (!this.isRemote)
            return super.getEpistemicModel();

        return this.getCurrentModel() || new ExplicitEpistemicModel();
    }

    private getCurrentModel(): EpistemicModel {
        return (<RemoteDescription>super.getExampleDescription()).getCurrentModel();
    }

    setEpistemicModel(M: EpistemicModel) {
        if (!this.isRemote)
            return super.setEpistemicModel(M);

    }

    getExampleDescription(): ExampleDescription {
        return super.getExampleDescription();
    }

    getActions(): Action[] {
        return super.getActions();
    }

    getExecutableActions(): Action[] {
        return super.getExecutableActions();
    }


    perform(action: Action) {
        return super.perform(action);
    }

    reset() {
        return super.reset();

    }


}

