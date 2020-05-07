import {Environment} from './environment';
import forceSync from 'sync-rpc';
import {ExplicitEpistemicModel} from './../epistemicmodel/explicit-epistemic-model';
import {EpistemicModel} from './../epistemicmodel/epistemic-model';
import {World} from '../epistemicmodel/world';
import {ExampleDescription} from "./exampledescription";


class Point {
    x: number;
    y: number;
}

export abstract class ExampleDescriptionAsync extends ExampleDescription {
    async abstract getAtomicPropositionsAsync(): Promise<string[]>

    async abstract getNameAsync();

    async abstract getInitialEpistemicModelAsync(): Promise<EpistemicModel>;

    async abstract getDescriptionAsync(): Promise<string[]>

    async abstract getActionsAsync();

    getAtomicPropositions(): string[] {
        return forceSync(this.getAtomicPropositionsAsync());
    }

    getName() {
        return forceSync(this.getNameAsync());
    }

    getInitialEpistemicModel(): EpistemicModel {
        return forceSync(this.getInitialEpistemicModelAsync());
    }

    getDescription(): string[] {
        return forceSync(this.getDescriptionAsync());
    }

    getActions() {
        return forceSync(this.getActionsAsync());
    }

}
