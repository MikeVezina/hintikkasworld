import {Environment} from "./environment";
import {CustomDescription} from "./CustomDescription";
import {Formula, FormulaFactory} from "../formula/formula";
import {ExplicitFilterEventModel} from "../eventmodel/explicit-filter-event-model";

export class CustomEnvironment extends Environment {

    private readonly customDesc: CustomDescription;
    private readonly agents: string[] = ['a', 'b', 'c', 'd'];

    constructor(desc: CustomDescription) {
        super(desc);
        this.customDesc = desc;
    }

    public getExampleDescription(): CustomDescription {
        return this.customDesc;
    }

    public getAgents(): string[] {
        return this.agents;
    }

    /**
     * Returns a Promise to determine whether or not a given formula is true or false in the current epistemic model.
     * @param formula
     */
    public async modelCheckFormula(formula: Formula | string): Promise<boolean> {
        if (formula instanceof String || typeof formula === 'string') {
            formula = FormulaFactory.createFormula(<string> formula);
        }

        return await this.getEpistemicModel().check(<Formula> formula);
    }

    async updateModel(agent: string, props: string[]) {
        let initModel = this.customDesc.getInitialEpistemicModel();

        let event = ExplicitFilterEventModel.getActionModelNewInformation(initModel, props, agent);

        return this.customDesc.apply(event);

    }

    toJSON(): object {
        return this.valueOf();
    }

    valueOf(): Object {
        return {
            model: super.getEpistemicModel(),
            description: super.getExampleDescription()
        };
    }
}
