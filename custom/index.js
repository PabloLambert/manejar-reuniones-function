const Alexa = require('ask-sdk');


const LaunchRequestHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
   },
   handle(handlerInput) {

       const airportNames = 	[
           {
               "id": "LAS",
               "name": {
                   "value": "La Serena",
                   "synonyms": [
                       "papaya"
                   ]
               }
           },
           {
               "id": "TEM",
               "name": {
                   "value": "Temuco",
                   "synonyms": [
                       "mapuche",
                       "pucón"
                   ]
               }
           }
       ];

       const airportNamesEntities = {
           type: "Dialog.UpdateDynamicEntities",
           updateBehavior: "REPLACE",
           types: [
               {
                   name: "AirportType",
                   values: airportNames
               }
           ]
       };


       const speechText = 'Bienvenido a aeropuerto! ¿Adónde quieres viajar?';
       return handlerInput.responseBuilder
           .addDirective(airportNamesEntities)
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};

const TravelIntentHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'TravelIntent';
   },
   handle(handlerInput) {

       let value = handlerInput.requestEnvelope.request.intent.slots.airport.value;

       let speechText = "";

       if ( !isEmpty(value) ) {
         speechText += "Viajando a: " + value;
       }
       else {
         speechText += "Hm...no entendí donde viajas";
       }

       return handlerInput.responseBuilder
           .speak(speechText)
           //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
           .getResponse();
   }
};

const HelpIntentHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
   },
   handle(handlerInput) {
       const speechText = '¿Te puedo ayudar?';

       return handlerInput.responseBuilder
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};
const CancelAndStopIntentHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
               || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
   },
   handle(handlerInput) {
       const speechText = 'Adiós!';
       return handlerInput.responseBuilder
           .speak(speechText)
           .getResponse();
   }
};
const SessionEndedRequestHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
   },
   handle(handlerInput) {
       // Any cleanup logic goes here.
       return handlerInput.responseBuilder.getResponse();
   }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest';
   },
   handle(handlerInput) {
       const intentName = handlerInput.requestEnvelope.request.intent.name;
       const speechText = `You just triggered ${intentName}`;

       return handlerInput.responseBuilder
           .speak(speechText)
           //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
           .getResponse();
   }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
   canHandle() {
       return true;
   },
   handle(handlerInput, error) {
       console.log(`~~~~ Error handled: ${error.message}`);
       const speechText = "hay un error, intentar otra vez";

       return handlerInput.responseBuilder
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};


const getStaticAndDynamicSlotValues = function(slots) {
   const slotValues = {}
   for (let slot in slots) {
       slotValues[slot] = getStaticAndDynamicSlotValuesFromSlot(slots[slot]);
   }
   return slotValues;
}

const getStaticAndDynamicSlotValuesFromSlot = function(slot) {

   const result = {
       name: slot.name,
       value: slot.value
   };

   if (((slot.resolutions || {}).resolutionsPerAuthority || [])[0] || {}) {
       slot.resolutions.resolutionsPerAuthority.forEach((authority) => {
           const slotValue = {
               authority: authority.authority,
               statusCode: authority.status.code,
               synonym: slot.value || undefined,
               resolvedValues: slot.value
           };
           if (authority.values && authority.values.length > 0) {
               slotValue.resolvedValues = [];

               authority.values.forEach((value) => {
                   slotValue.resolvedValues.push(value);
               });

           }

           if (authority.authority.includes('amzn1.er-authority.echo-sdk.dynamic')) {
               result.dynamic = slotValue;
           } else {
               result.static = slotValue;
           }
       });
   }
   return result;
};

function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
   .addRequestHandlers(
       LaunchRequestHandler,
       TravelIntentHandler,
       HelpIntentHandler,
       CancelAndStopIntentHandler,
       SessionEndedRequestHandler,
       IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
   .addErrorHandlers(
       ErrorHandler)
   .lambda();
