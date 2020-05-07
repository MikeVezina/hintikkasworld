import {environment} from 'src/environments/environment';
import {ExplicitEpistemicModel} from './../epistemicmodel/explicit-epistemic-model';
import {Postcondition} from './postcondition';
import {PropositionalAssignmentsPostcondition} from './propositional-assignments-postcondition';
import {TrivialPostcondition} from './trivial-postcondition';
import {
    AndFormula,
    AtomicFormula,
    FalseFormula,
    Formula,
    FormulaFactory,
    NotFormula,
    TrueFormula
} from './../formula/formula';
import {EventModel} from './event-model';
import {Graph} from './../graph';
import {Event} from './event';
import {World} from '../epistemicmodel/world';
import {ExplicitEventModel} from "./explicit-event-model";

export class ExplicitFilterEventModel extends ExplicitEventModel {

    readonly propEval: string[];
    readonly initialModel: ExplicitEpistemicModel;

    constructor(propEval: string[], initialModel: ExplicitEpistemicModel) {
        super();
        this.propEval = propEval;
        this.initialModel = initialModel;
    }

    async isApplicableIn(): Promise<boolean> {

        return Promise.resolve(this.initialModel.hasPossibleWorld(this.propEval));
    }

    /**
     * Applies the set propositions to the initial model. Does not update the current model.
     * @param M (unused) the current model.
     */
    apply(): ExplicitEpistemicModel {

        // Update the pointed world to reflect new information
        // This could benefit from memoization (pointed world is already calculated during 'isApplicableIn'
        this.initialModel.setPointedWorld(this.propEval);

        return super.apply(this.initialModel);
    }


    static getActionModelNewInformation(initialModel: ExplicitEpistemicModel, propEval: string[], agent: string) {
        var E = new ExplicitFilterEventModel(propEval, initialModel);

        let formula = ExplicitFilterEventModel.createFormulaFromProps(propEval);

        // Create nodes that match the formula
        E.addAction("e", formula);

        // Nodes that do not match the formula
        E.addAction("f", new NotFormula(formula));

        // Only create edges for worlds that belong together
        E.addEdge(agent, "e", "e");
        E.addEdge(agent, "f", "f");

        // Point to the action where formula is true
        E.setPointedAction("e");
        return E;
    }

    private static createFormulaFromProps(propEval: string[]) : AndFormula {
        // Create array of atomic props
        let atomicProps : AtomicFormula[] = [];

        for (let prop of propEval)
            atomicProps.push(new AtomicFormula(prop));

        return new AndFormula(atomicProps);
    }


}


