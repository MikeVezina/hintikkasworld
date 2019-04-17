import { Valuation } from './../epistemicmodel/valuation';
import { BDDNode, BddService } from './../../../../services/bdd.service';
import { Formula } from './formula';
import * as types from './../formula/formula';

export class BDD {

    bddNode: BDDNode;
    static bddService: BddService = new BddService(() => {});

    constructor(b:BDDNode) {
        // BDD.bddService.save(b); 
    }

    get thisbddNode() {
        return this.bddNode;
    }
    static buildFromFormula(f:Formula):BDDNode {
        return BDD.getBDDNode(f);
    }
    pickRandomSolution(): Valuation {
        return BDD.bddService.pickRandomSolution(this.bddNode);
    }
    private static getBDDNode(phi: Formula): BDDNode {

        switch (true) {
            case (phi instanceof types.TrueFormula): return BDD.bddService.createTrue();
            case (phi instanceof types.FalseFormula): return BDD.bddService.createFalse();
            case (phi instanceof types.AtomicFormula): 
                return BDD.bddService.createLiteral((<types.AtomicFormula>phi).getAtomicString());
            case (phi instanceof types.ImplyFormula):
                return BDD.bddService.applyImplies(this.getBDDNode((<types.ImplyFormula>phi).formula1), this.getBDDNode((<types.ImplyFormula>phi).formula2));
            case (phi instanceof types.EquivFormula):
                return BDD.bddService.applyEquiv(this.getBDDNode((<types.ImplyFormula>phi).formula1), this.getBDDNode((<types.ImplyFormula>phi).formula2));
            case (phi instanceof types.AndFormula):
                return BDD.bddService.applyAnd((<types.AndFormula>phi).formulas.map((f) => this.getBDDNode(f)));

            case (phi instanceof types.OrFormula):
                return BDD.bddService.applyOr((<types.AndFormula>phi).formulas.map((f) => this.getBDDNode(f)));
            case (phi instanceof types.XorFormula): {
                throw new Error("to be implemented");
            }
            case (phi instanceof types.NotFormula): return BDD.bddService.applyNot(this.getBDDNode((<types.NotFormula>phi).formula));
            case (phi instanceof types.KFormula): {
                throw new Error("formula should be propositional");
            }
            case (phi instanceof types.KposFormula):
                throw new Error("formula should be propositional");
            case (phi instanceof types.KwFormula): {
                throw new Error("formula should be propositional");
            }
            case (phi instanceof types.ExactlyFormula): {
                return BDD.createExactlyBDD((<types.ExactlyFormula>phi).count, (<types.ExactlyFormula>phi).variables);
            }
        }
        throw Error("type of phi not found");
    }




    private static createExactlyBDD(n: number, vars: string[]) {
        let dic: BDDNode[] = [];

        function store(kVar: number, i: number, b: BDDNode) {
            dic[kVar * n + i] = b;
        }

        function getExactlyBDD(kVar, i) {
            return dic[kVar * n + i];
        }

        for (let kVar = vars.length - 1; kVar >= 0; kVar--) {
            store(kVar, 0, this.getBDDNode(new types.AndFormula(vars.slice(kVar).map((p) => new types.NotFormula(new types.AtomicFormula(p))))));

            for (let i = 0; i <= n; i++) {
                    let b1 = getExactlyBDD(kVar+1, i-1);
                    let b2 = getExactlyBDD(kVar, i);

                    store(kVar, i, BDD.bddService.applyIte(BDD.bddService.createLiteral(vars[kVar]), b1, b2));
            }
        }

        return getExactlyBDD(0, n);
    }

    static and(lb:BDD[]):BDD {
        return new BDD(BDD.bddService.applyAnd(lb.map(b => (b.thisbddNode))))
    }
    static or(lb:BDD[]):BDD {
        return new BDD(BDD.bddService.applyOr(lb.map(b => (b.thisbddNode))))
    }
    static not(b:BDD):BDD {
        return new BDD(BDD.bddService.applyNot(b.thisbddNode))
    }
    static imply(b1:BDD,b2:BDD):BDD {
        return new BDD(BDD.bddService.applyImplies(b1.thisbddNode,b2.thisbddNode))
    }
    static equiv(b1:BDD,b2:BDD):BDD {
        return new BDD(BDD.bddService.applyEquiv(b1.thisbddNode,b2.thisbddNode))
    }
    static universalforget(b:BDD,vars:string[]) {
        return new BDD(BDD.bddService.applyUniversalForget(b.thisbddNode,vars))
    }
    static existentialforget(b:BDD,vars:string[]) {
        return new BDD(BDD.bddService.applyExistentialForget(b.thisbddNode,vars))
    }

}
