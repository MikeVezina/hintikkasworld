import {EventModelAction} from "./event-model-action";
import {ExplicitEventModel} from "../eventmodel/explicit-event-model";
import {EpistemicModel} from "../epistemicmodel/epistemic-model";

export class RefreshAction extends EventModelAction {

    private refreshCallback: CallableFunction;

    constructor(refreshCallback: CallableFunction) {
        super({name: "Refresh Model", eventModel: new ExplicitEventModel()});
        this.refreshCallback = refreshCallback;
    }


    async isApplicableIn(M: EpistemicModel): Promise<boolean> {
        return true;
    }

    perform(M: EpistemicModel): EpistemicModel {
        this.refreshCallback();
        return M;
    }
}
