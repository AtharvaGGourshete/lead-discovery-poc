export function qualifyLead(score){

    if(score>=70){

        return{

            qualified:true,

            priority:"HIGH"

        };

    }

    if(score>=40){

        return{

            qualified:true,

            priority:"MEDIUM"

        };

    }

    return{

        qualified:false,

        priority:"LOW"

    };

}