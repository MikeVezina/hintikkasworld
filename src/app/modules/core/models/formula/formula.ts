import { Scheme } from './scheme';

export interface Formula {
     
}

export class TrueFormula implements Formula {

}
export class FalseFormula implements Formula {

}
export class AtomicFormula implements Formula {
    private _atomicString: string;
    constructor(name: string) {
        this._atomicString = name;
    }

    getAtomicString(): string {
        return this._atomicString;
    }
}

export class OrFormula implements Formula {
    private _formulas: Array<Formula>;
    constructor(f: Array<Formula>) {
        this._formulas = f;
    }
    get formulas() {
        return this._formulas;
    }
}

export class AndFormula implements Formula {
    private _formulas: Array<Formula>;
    constructor(f: Array<Formula>) {
        this._formulas = f;
    }
    get formulas() {
        return this._formulas;
    }
}

export class KFormula implements Formula {
    private _agent: string;
    private _formula: Formula;
    constructor(a: string, f: Formula) {
        this._agent = a;
        this._formula = f;
    }
    get agent() {
        return this._agent;
    }
    get formula() {
        return this._formula;
    }
}

export class KposFormula implements Formula {
    private _agent: string;
    private _formula: Formula;
    constructor(a: string, f: Formula) {
        this._agent = a;
        this._formula = f;
    }
    get agent() {
        return this._agent;
    }
    get formula() {
        return this._formula;
    }
}

export class KwFormula implements Formula {
    private _agent: string;
    private _formula: Formula;
    constructor(a: string, f: Formula) {
        this._agent = a;
        this._formula = f;
    }
    get agent() {
        return this._agent;
    }
    get formula() {
        return this._formula;
    }
}


export class NotFormula implements Formula {
    private _formula: Formula;
    constructor(f: Formula) {
        this._formula = f;
    }
    get formula() {
        return this._formula;
    }
}


export class XorFormula implements Formula {
    private _formulas: Array<Formula>;
    constructor(f: Array<Formula>) {
        this._formulas = f;
    }
    get formulas() {
        return this._formulas;
    }
}


export class ImplyFormula implements Formula {
    private _formula1: Formula;
    private _formula2: Formula;
    constructor(f1: Formula, f2: Formula) {
        this._formula1 = f1;
        this._formula2 = f2;
    }
    get formula1() {
        return this._formula1;
    }
    get formula2() {
        return this._formula2;
    }
}


export class EquivFormula implements Formula {
    private _formula1: Formula;
    private _formula2: Formula;
    constructor(f1: Formula, f2: Formula) {
        this._formula1 = f1;
        this._formula2 = f2;
    }
    get formula1() {
        return this._formula1;
    }
    get formula2() {
        return this._formula2;
    }
}
/* export enum FormulaType {
    Atomic, Or, And, K, Kpos, Kw, Not, Xor, Imply, Equiv, True, False
} */


export class FormulaFactory{
    private _content: Formula;


    static createformula(schemeExpression: string | Array<any>) {
        let ast;
        if (typeof schemeExpression == "string")
            ast = Scheme.parser(<string> schemeExpression);
        else
            ast = schemeExpression;

        return this.installFormula(ast);
    }


    private static installFormula(ast: string | Array<any>){
        if (ast instanceof Array) {
           if ((ast[0] == "K") || (ast[0] == "know") || (ast[0] == "box") || (ast[0] == "[]")) {
                if(ast.length != 3) throw "Parsing error: (K a phi)";
                return new KFormula(ast[1], this.installFormula(ast[2]))
            } else if ((ast[0] == "Kpos") || (ast[0] == "knowpos") || (ast[0] == "diamond") || (ast[0] == "<>")) {
                if(ast.length != 3) throw "Parsing error: (Kpos a phi)";
                return new KposFormula(ast[1], this.installFormula(ast[2]))
            } else if ((ast[0] == "Kw") || (ast[0] == "knowwhether")) {
                if(ast.length != 3) throw "Parsing error: (Kw a phi)";
                return new KwFormula(ast[1], this.installFormula(ast[2]))
            } else if (ast[0] == "not") {
                if(ast.length != 2) throw "Parsing error: (not phi)";
                return new NotFormula(this.installFormula(ast[1]))
            }
            else if (ast[1] == "and") {
                return new AndFormula(ast.slice(1).map(this.installFormula))
            }
            else if (ast[1] == "or") {
                return new OrFormula(ast.slice(1).map(this.installFormula))
            }
            else if (ast[1] == "xor") {
                return new XorFormula(ast.slice(1).map(this.installFormula))
            }
            else if ((ast[1] == "->" || ast[1] == "imply")) {
                return new ImplyFormula(this.installFormula(ast[0]),this.installFormula(ast[2]))
            }
            else if ((ast[1] == "<->" || ast[1] == "equiv")) {
                return new EquivFormula(this.installFormula(ast[0]),this.installFormula(ast[2]))
            } 
            else {
                throw "Error while parsing the formula";
            }

        }
        else if (ast == "top" || ast == "true" || ast == "1") {
            return new TrueFormula
        }
        else if (ast == "bottom" || ast == "false" || ast == "0") {
            return new FalseFormula
        }
        else {
            return new AtomicFormula(ast)
        }
    }

    prettyPrint(): string {
        throw "To be implemented by Tristan Charrier";
    }
    get content() {
        return this._content;
    }
}