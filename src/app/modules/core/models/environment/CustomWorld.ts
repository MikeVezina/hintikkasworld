import {WorldValuation} from "../epistemicmodel/world-valuation";
import {Valuation} from "../epistemicmodel/valuation";


export class CustomWorld extends WorldValuation {
    constructor(valuation: Valuation) {
        super(valuation);
    }

}
