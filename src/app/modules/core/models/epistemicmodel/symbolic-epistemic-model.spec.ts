import { WorldValuation } from './world-valuation';
import { SymbolicEpistemicModel } from './symbolic-epistemic-model';
import { SymbolicRelation, Obs } from './symbolic-relation';
import { AtomicFormula } from '../formula/formula';


describe('SymbolicEpistemicModel', () => {
  it('should create an instance, with good copy of agents', () => {
    let relationsSymboliques:Map<string, SymbolicRelation> = new Map(); 
    relationsSymboliques["a"] = new Obs(["var1"]);
    console.log(relationsSymboliques);
    let sem = new SymbolicEpistemicModel(WorldValuation, ["a", "b"], ["var1", "var2"], relationsSymboliques, new AtomicFormula("var1"));
    expect(sem).toBeTruthy();
    expect(sem.getAgents() == ["a"])
  });

});
