import { Formula, FormulaFactory, TrueFormula, AndFormula, EquivFormula, AtomicFormula} from '../formula/formula';
import { SymbolicEpistemicModel } from './symbolic-epistemic-model';
import { BddService, BDDNode } from '../../../../services/bdd.service';
import { BDD } from '../formula/bdd';

export interface SymbolicRelation {
    toFormula(): Formula;
    toBDD(): BDDNode;
}

/**
 * this class implements a SymbolicRelation for an agent that observes
 * the truth values of some propositional variables.
 */
export class Obs implements SymbolicRelation {

    /**
     * What is known by the agent : String (which are atoms), or Formula.
     * "a" <=> AtomicFormula("a")
     */
    protected readonly observedVariables: (Formula|string)[];

    constructor(observedVariables: (Formula|string)[]) {
        this.observedVariables = observedVariables;
    }

    /**
     * Return the formula of the SymbolicRelation
     */
    toFormula() : Formula {
        let list_formula: Formula[] = [];
        for(let form of this.observedVariables){
            if(typeof form == "string"){
                list_formula.push(new EquivFormula(new AtomicFormula(form), new AtomicFormula(SymbolicEpistemicModel.getPrimedVarName(form))));
            }else{
                list_formula.push(
                    new EquivFormula(form, form.renameAtoms((name) => { return SymbolicEpistemicModel.getPrimedVarName(name); } ))
                );
            }
        }
        return new AndFormula(list_formula);
    }

    /**
     * Return the BDD of the SymbolicRelation, build thanks to the toFormula()
     */
    toBDD() : BDDNode {
        let formula = this.toFormula();
        console.log(formula.prettyPrint());
        console.log(formula);
        let res = null;
        try {
            res = BDD.buildFromFormula(formula);
        } catch (error) {
            console.log(BDD.bddService.stackTrace());
            console.log("Erreur dans la contruction de la formule !")
            console.log("Trace : ", error.stack);
            throw error;
        }
        return res;
    }
}
