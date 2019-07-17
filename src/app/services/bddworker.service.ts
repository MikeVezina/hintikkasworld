import { BDDNode } from '../modules/core/models/epistemicmodel/bddnode'
import { Formula, TrueFormula } from '../modules/core/models/formula/formula';


/**
 * This class create a worker and transfer data to 
 * it. The worker is responsable to build the symbolic epistemic
 * model.
 */
export class BDDWorkerService {
    
  static i = 0;
  static promises = [];

  private static worker = BDDWorkerService.createWorker();

  /**
   * Function to create the worker. This function has to be static.
   * This function also describe worker's function onmessage and 
   * postmessage.
   */
  static createWorker() {
    let worker = new Worker('../modules/core/services/bddworker.worker.ts', { type: 'module' });
    console.log("creating BDDWorkerService");
    console.log("Worker created");
    /** function called when the worker has computed the result of sth */
    worker.onmessage = (msg) => {
      const { id, err, result } = msg.data
    //  console.log("data received from the worker: ");
    //  console.log(msg.data.result.toString());
    //  if (result) {
      //  console.log("the worker answered : " + result);
        const resolve = BDDWorkerService.promises[id].resolve
        if (resolve) {
          resolve(result)
        }
    /*  } else {
        // error condition
        const reject = BDDWorkerService.promises[id].reject
        if (reject) {
          if (err) {
            reject(err)
          } else {
            reject('Got nothing from the worker')
          }
        }
      }*/

      // purge used callbacks
      delete BDDWorkerService.promises[id].resolve
      delete BDDWorkerService.promises[id].reject
    }

    return worker;
  }

  /**
   * Those functions keep the same functionality as functions
   * in the bddservice class. It calls the functions call of 
   * BDDWorkerService to pass a formula to the worker.
   */
  public static formulaToBDD(formula: Formula): Promise<BDDNode> {
    console.log("formulaToBDD begin... the formula is:");
    let formulaString = formula.prettyPrint();
    console.log(formulaString);
    return BDDWorkerService.call("formulaStringToBDD", [formulaString]);
  }

  public static applyAnd(args: BDDNode[]): Promise<BDDNode> {
    return BDDWorkerService.call("applyAnd", [args]);
  }


  public static createTrue(): Promise<BDDNode> {
    return BDDWorkerService.call("createTrue", []);
  }

  public static createFalse(): Promise<BDDNode> {
    return BDDWorkerService.call("createFalse", []);
  }

  public static createCopy(bdd: BDDNode): Promise<BDDNode> {
    return BDDWorkerService.call("createCopy", [bdd]);
  }


  public static createCube(valuation: {[p: string]: boolean}) {
    return BDDWorkerService.call("createCube", [valuation]);
  }


  public static applyExistentialForget(b: BDDNode, atoms: string[]): Promise<BDDNode> {
    return BDDWorkerService.call("applyExistentialForget", [b, atoms]);
  }


  public static applyRenaming(b: BDDNode, renaming: Map<string, string>): Promise<BDDNode> {
    return BDDWorkerService.call("applyRenaming", [b, renaming]);
  }

  public static pickAllSolutions(b: BDDNode, atoms: string[]) : Promise<string[][]> {
    return BDDWorkerService.call("pickAllSolutions", [b, atoms]);
  }

  public static countSolutions(b: BDDNode, atoms: string[]): Promise<number> {
    return BDDWorkerService.call("countSolutions", [b, atoms]);
  }

  public static pickRandomSolution(b: BDDNode, atoms: string[]) {
    return BDDWorkerService.call("pickRandomSolution", [b, atoms]);
  }

  public static applyConditioning(b: BDDNode, assignment: { [p: string]: boolean }) {
    return BDDWorkerService.call("applyConditioning", [b, assignment]);
  }

  public static isConsistent(b: BDDNode): Promise<boolean> {
    return BDDWorkerService.call("isConsistent", [b]);
  }

  public static applyOr(bdds: BDDNode[]): Promise<BDDNode> {
    return BDDWorkerService.call("applyOr", [bdds]);
  }

  public static applyEquiv(b1, b2: BDDNode): Promise<BDDNode> {
    return BDDWorkerService.call("applyEquiv", [b1, b2]);
  }

  public static applyNot(b: number): Promise<BDDNode> {
    return BDDWorkerService.call("applyNot", [b])
  }

  static async debugInfo(str: string, b: number) {
    console.log("InfoBDD for " + str + ": ADDR=" + b + "     isSat=" + await BDDWorkerService.isConsistent(b));
}

  public static createLiteral(a: string): Promise<BDDNode> {
    return BDDWorkerService.call("createLiteral", [a]);
  }

  /**
   * 
   * @param functionName 
   * @param args 
   * @description call the method functionName of BDDService on the webworker side with the arguments args
   */
  public static call(functionName: String, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {

      let id = BDDWorkerService.i++;
      BDDWorkerService.promises[id] = { resolve: resolve, reject: reject };

      //we send formula to the worker
      //id = id of the task
      BDDWorkerService.worker.postMessage({ id: id, functionName: functionName, args: args });
    });
  }
}
