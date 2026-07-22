import { leadProfiles } from "../config/leadProfiles.js";

export function evaluateCompany(company, profile="architecture"){

    const config = leadProfiles[profile];

    let score=0;

    const matchedTriggers=[];

    for(const event of company.events){

        const weight=config.triggerWeights[event.type];

        if(weight){

            score+=weight;

            matchedTriggers.push(event.type);

        }

    }

    return{

        leadScore:Math.min(score,100),

        matchedTriggers

    };

}