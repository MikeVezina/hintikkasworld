import {ExplicitEventModel} from './../eventmodel/explicit-event-model';
import {ExplicitEpistemicModel} from './../epistemicmodel/explicit-epistemic-model';
import {WorldValuation} from './../epistemicmodel/world-valuation';
import {environment} from 'src/environments/environment';
import {ExampleDescription} from '../environment/exampledescription';
import {Valuation} from '../epistemicmodel/valuation';
import {World} from '../epistemicmodel/world';
import {EventModelAction} from '../environment/event-model-action';
import {FormulaFactory} from '../formula/formula';
import {Environment} from "../environment/environment";
import {ExplicitFilterEventModel} from '../eventmodel/explicit-filter-event-model';

let agents = {
    'a': "alice",
    'b': "bob",
    'c': "charlie",
};


/**
 * @param valuation a valuation
 * */
class AcesAndEightsWorld extends WorldValuation {


    constructor(valuation: Valuation) {
        super(valuation);
        this.agentPos['a'] = {x: 32, y: 32, r: 16};
        this.agentPos['b'] = {x: 68 + 5, y: 20, r: 16};
        this.agentPos['c'] = {x: 68 + 42, y: 32, r: 16};

    }

    draw(context: CanvasRenderingContext2D) {
        this.drawAgents(context);
        context.font = '12px Verdana';
        context.strokeStyle = '#000000';
        for (var agent of Object.keys(agents)) {
            for (var first_card of ['A', '8']) {
                for (var second_card of ['A', '8']) {
                    let agent_number = agents[agent];

                    // Checks if card proposition is true, and draws that card (for a and b only)
                    if (this.modelCheck(agent_number + '_' + first_card + second_card)) {
                        WorldValuation.drawCard(context, {
                            x: this.agentPos[agent].x - 16,
                            y: this.agentPos[agent].y,
                            w: 10,
                            text: first_card,
                            fontSize: 10
                        });
                        WorldValuation.drawCard(context, {
                            x: this.agentPos[agent].x - 6,
                            y: this.agentPos[agent].y,
                            w: 10,
                            text: second_card,
                            fontSize: 10
                        });
                    }
                }
            }
        }

    }

}


export class AcesAndEights extends ExampleDescription {
    getDescription(): string[] {
        return ['Three agents are each assigned two cards. Agents can only see the cards of other agents, and must use announcements to determine which cards they have. '];
    }

    agent1;
    agent2;
    agent3;
    model;

    getAtomicPropositions() {
        let A = [];
        for (let x = 1; x <= 3; x++) {
            ['AA', 'A8', '88'].forEach((prop) => {
                let ag = "";
                if (x == 1)
                    ag = "alice_";
                if (x == 2)
                    ag = "bob_";
                if (x == 3)
                    ag = "charlie_";

                A.push(ag + prop.toString())
            });
        }

        return A;
    }

    public onRealWorldClickRightButton(env: Environment, point: any): void {
        let model = <ExplicitEpistemicModel>env.getEpistemicModel();
        console.log(model.getPointedWorldID());
    };

    getName() {
        return 'Aces & Eights';
    }

    getInitialEpistemicModel() {

        const create_combinations = (inputArr) => {

            let result = [];

            for (let i = 0; i < inputArr.length; i++) {
                for (let j = 0; j < inputArr.length; j++) {
                    for (let k = 0; k < inputArr.length; k++) {
                        result.push([inputArr[i], inputArr[j], inputArr[k]]);
                    }
                }
            }

            return result;

        };

        this.model = new ExplicitEpistemicModel();
        let M = this.model;

        let combinations = create_combinations(['AA', 'A8', '88']);

        console.log(combinations);

        // These are all the invalid permutations (there are a maximum of four Aces and four Eights)
        let invalid_permutations = [
            ['AA', 'AA', 'AA'],
            ['A8', 'AA', 'AA'],
            ['AA', 'A8', 'AA'],
            ['AA', 'AA', 'A8'],

            ['88', '88', '88'],
            ['A8', '88', '88'],
            ['88', 'A8', '88'],
            ['88', '88', 'A8'],
        ];

        combinations = combinations.filter((f) => !invalid_permutations.some(r => JSON.stringify(r) === JSON.stringify(f)));

        for (let combination of combinations) {
            M.addWorld('w_alice_' + combination[0] + '_bob_' + combination[1] + '_charlie_' + combination[2] + "", new AcesAndEightsWorld(new Valuation(['alice_' + combination[0], 'bob_' + combination[1], 'charlie_' + combination[2] + ""])));
        }

        Object.keys(agents).forEach(agent =>
            M.addEdgeIf(agent, function (w1, w2) {

                let agent_number = agents[agent];


                if (agent_number !== 'alice')
                    return false;

                return true;

                if (agent_number === 'charlie')
                    return false;


                let other_agent_props = Object.keys(w1.valuation.getPropositionMap()).filter(prop => !prop.startsWith(agent_number));
                return other_agent_props.every(other_agent_prop => w1.modelCheck(other_agent_prop) === w2.modelCheck(other_agent_prop));
            }));


        let selected = Math.floor(Math.random() * combinations.length);
        let selected_cards = combinations[selected];

        this.agent1 = "88"//selected_cards[0];
        this.agent2 = "A8"//selected_cards[1];
        this.agent3 = "AA"//selected_cards[2];

        let world_name = 'w_alice_' + this.agent1 + '_bob_' + this.agent2 + '_charlie_' + this.agent3;
        console.log(world_name);


        console.log(world_name);

        // Alice's POV
        M.setPointedWorld([]);
        M.setPointedWorld(["bob_A8"]);
        // M.removeUnReachablePartFrom(world_name);
        return M;
    }

    cachedInitialModel;

    createNewInfoAction(props, agent): EventModelAction {
        if (!this.cachedInitialModel)
            this.cachedInitialModel = this.getInitialEpistemicModel();

        let event = ExplicitFilterEventModel.getActionModelNewInformation(this.cachedInitialModel, props, agent);
        let agentName = agents[agent];

        return new EventModelAction({
            name: agentName + " can see " + JSON.stringify(props),
            eventModel: event
        })
    }

    getActions() {

        return [
            this.createNewInfoAction(["bob_AA"], "a"),
            this.createNewInfoAction(["charlie_AA"], "a"),
            this.createNewInfoAction(["bob_A8"], "a"),

            this.createNewInfoAction(["bob_AA", "charlie_AA"], "a"),
            this.createNewInfoAction(["bob_88", "charlie_AA"], "a"),
            this.createNewInfoAction(["bob_A8", "charlie_AA"], "a"),

            //
            // new EventModelAction({
            //     name: 'Alice does not know',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(form)
            // }),
            // new EventModelAction({
            //     name: 'Alice knows',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K a alice_AA) or (K a alice_A8) or (K a alice_88))'))
            // }),
            // new EventModelAction({
            //     name: 'Bob does not know',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K b bob_AA) or (K b bob_A8) or (K b bob_88)))'))
            // }),
            // new EventModelAction({
            //     name: 'Bob knows',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K b bob_AA) or (K b bob_A8) or (K b bob_88))'))
            // }),
            // new EventModelAction({
            //     name: 'Carl does not know',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('(not((K c charlie_AA) or (K c charlie_A8) or (K c charlie_88)))'))
            // }),
            // new EventModelAction({
            //     name: 'Carl knows',
            //     eventModel: ExplicitEventModel.getEventModelPublicAnnouncement(FormulaFactory.createFormula('((K c charlie_AA) or (K c charlie_A8) or (K c charlie_88))'))
            // }),


        ];

    }


}
