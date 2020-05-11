import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ExplicitEpistemicModel} from '../epistemicmodel/explicit-epistemic-model';
import {ExampleDescription} from '../environment/exampledescription';
import {CustomDescription} from "../environment/CustomDescription";
import {EpistemicModel} from "../epistemicmodel/epistemic-model";
import {WorldValuation} from "../epistemicmodel/world-valuation";
import {Valuation} from "../epistemicmodel/valuation";
import {RefreshAction} from "../environment/refresh-action";



export class RemoteDescription extends ExampleDescription {

    remoteDesc: CustomDescription;

    constructor() {
        super();
    }


    getDescription(): string[] {
        return this.remoteDesc ? this.remoteDesc.getDescription() || ['Remote Description'] : ['Not Loaded'];
    }

    getAtomicPropositions(): string[] {
        return this.remoteDesc ? this.remoteDesc.getAtomicPropositions() || [] : [];
    }

    getName() {
        return this.remoteDesc ? this.remoteDesc.getName() || 'Remote Model' : "Not Loaded";
    }

    getInitialEpistemicModel() {
        return this.remoteDesc ? this.remoteDesc.getInitialEpistemicModel() : new ExplicitEpistemicModel();
    }

    getActions() {
        return this.remoteDesc ? this.remoteDesc.getActions() || [] : [];
    }

    setDescription(remoteDesc: CustomDescription) {
        this.remoteDesc = remoteDesc;
    }
}
