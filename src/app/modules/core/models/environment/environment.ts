import { Action } from './action';
import { ExampleDescription } from './exampledescription';
import { EpistemicModel } from '../epistemicmodel/epistemic-model';

export class Environment {
    private _epistemicModel;
    private _exampleDescription;

    constructor(exampleDescription: ExampleDescription) {
        this._exampleDescription = exampleDescription;
        this.reset();
    }

    getEpistemicModel() {
        return this._epistemicModel;
    }

    setEpistemicModel(M: EpistemicModel) {
        this._epistemicModel = M;
    }

    getActions() {
        return this._exampleDescription.getActions();
    }


    perform(action: Action) {
        this._epistemicModel = action.perform(this._epistemicModel);
    }

    reset() {
        this._epistemicModel = this._exampleDescription.getInitialEpistemicModel();
    }
}