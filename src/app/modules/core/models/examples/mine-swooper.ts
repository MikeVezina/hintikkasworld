import {
    AndFormula,
    AtomicFormula,
    ExactlyFormula,
    Formula,
    FormulaFactory,
    TrueFormula,
    XorFormula
} from './../formula/formula';
import {WorldValuation} from './../epistemicmodel/world-valuation';
import {ExampleDescription} from '../environment/exampledescription';
import {Environment} from '../environment/environment';
import {Valuation} from '../epistemicmodel/valuation';
import {SymbolicEpistemicModel} from '../epistemicmodel/symbolic-epistemic-model';
import {Obs, SymbolicRelation} from '../epistemicmodel/symbolic-relation';
import {WorldValuationType} from '../epistemicmodel/world-valuation-type';
import {SEModelDescriptor} from '../epistemicmodel/descriptor/se-model-descriptor';
import {SEModelInternalDescriptor} from "../epistemicmodel/descriptor/se-model-internal-descriptor";

import { BDDWorkerService } from './../../../../services/bddworker.service';
import { EventModelAction } from './../environment/event-model-action';
import { SymbolicPublicAnnouncement } from './../eventmodel/symbolic-public-announcement';
import { ExplicitEpistemicModel } from './../epistemicmodel/explicit-epistemic-model';

function curryClass(SourceClass) {
    var curriedArgs = Array.prototype.slice.call(arguments, 1);

    return function curriedConstructor() {
        var combinedArgs = curriedArgs.concat(Array.prototype.slice.call(arguments, 0));

        // Create an object that inherits from `proto`
        var hasOwnProto = Object(SourceClass.prototype) === SourceClass.prototype;
        var obj = Object.create(hasOwnProto ? SourceClass.prototype : Object.prototype);

        // Apply the function setting `obj` as the `this` value
        var ret = SourceClass.apply(obj, combinedArgs);

        if (Object(ret) === ret) { // the result is an object?
            return ret;
        }

        return obj;
    };
}

class MineSwooperWorld extends WorldValuation {
    static readonly xt = 38;
    static readonly yt = 0;

    constructor(valuation: Valuation) {
        super(valuation);
        this.agentPos["a"] = {x: 16, y: 32, r: 16};
    }

    draw(context: CanvasRenderingContext2D) {
        this.drawAgents(context);
        let initX = 0;
        let initY = 0;

        for (let key in this.valuation.propositions) {
            if (this.valuation.propositions[key]) {
                context.strokeText(key,30 + initX, 30 + initY);
                initX += 5;
            }
        }
    }

}

export class MineSwooper extends ExampleDescription {


    getDescription(): string[] {
        return ["swooping mines"];
    }

    constructor() {
        super();
    }


    getName() {
        return "Swoop!";
    }

    getAtomicPropositions() {
        let A = [];
        A.push("a");
        A.push("b");
        return A;
    }


    getWorldClass(): WorldValuationType {
        // <WorldValuationType><unknown>curryClass(MineSweeperWorld, this.nbrows, this.nbcols, this.clicked);
        return <WorldValuationType><unknown>curryClass(<WorldValuationType>MineSwooperWorld);
    }

    /*
     * @returns the initial Kripke model of MineSwooper
     */
    getInitialEpistemicModel(): SymbolicEpistemicModel {

        let example = this;

        /**
         * Good example of creating symbolic epistemic model in which
         * SEModelDescriptorFormulaMineSweeper implements SEModelDescriptor
         * to create a symbolic epismine-sweeper.tsemic model from crash.
         */
        class SEModelDescriptorFormulaMineSwooper implements SEModelDescriptor {
            getAtomicPropositions() {
                return example.getAtomicPropositions();
            }

            getAgents() {
                return ["a"];
            }

            getPointedValuation() {
                return example.getValuationExample();
            }

            getSetWorldsFormulaDescription(): Formula {
                return FormulaFactory.createFormula("((a or b) and not(a and b))");
            }

            getRelationDescription(agent: string): SymbolicRelation {
                return new Obs([]);
            }
        }

        return new SymbolicEpistemicModel(this.getWorldClass(), new SEModelDescriptorFormulaMineSwooper());
    }


    getValuationExample(): Valuation {
        let V = []
        V.push("a");
        return new Valuation(V);
    }

    getWorldExample() {
        // Create random valuation
        let valuationExample = this.getValuationExample();
        return new MineSwooperWorld(valuationExample);
    }

    /*
     * event when the player clicks on the real world
     */
    onRealWorldClick(env: Environment, point) {

    }

    getActions() {
        return [];
    }


}
