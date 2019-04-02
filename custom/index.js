const Alexa = require('ask-sdk');


const LaunchRequestHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
   },
   handle(handlerInput) {

       const speechText = 'Bienvenido a ver tus reuniones';
       return handlerInput.responseBuilder
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};

const CreateMeetingIntentHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'CreateMeetingIntent';
   },
   handle(handlerInput) {

     let value = handlerInput.requestEnvelope.request.intent.slots.NewMeetingName.value;

      const session = handlerInput.attributesManager.getSessionAttributes();
      if (isEmpty (session.meetingList )) {
          session.meetingList = [];
      }
      session.meetingList.push(value);
      handlerInput.attributesManager.setSessionAttributes(session);

      const MeetingList = [];
      if (! isEmpty (session.meetingList )) {
        session.meetingList.forEach( function(element, index, array) {
          MeetingList.push({
            "id": index,
            "name" : {
              "value": element,
              "synonyms" : []
            }
          });
        });
      }

      const meetingNamesEntities = {
          type: "Dialog.UpdateDynamicEntities",
          updateBehavior: "REPLACE",
          types: [
              {
                  name: "meetingNameType",
                  values: MeetingList
              }
          ]
      };

       let speechText = "";

       if ( !isEmpty(value) ) {
         speechText += "Creando reunión " + value;
       }
       else {
         speechText += "Hm...no recibí el meeting";
       }

       return handlerInput.responseBuilder
           .addDirective(meetingNamesEntities)
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};

const ListMeetingIntentHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
           && handlerInput.requestEnvelope.request.intent.name === 'ListMeetingIntent';
   },
   handle(handlerInput) {

     let speechText = "";

      const session = handlerInput.attributesManager.getSessionAttributes();
      if (isEmpty (session.meetingList )) {
          speechText += "No hay reuniones definidas";
      } else {
          session.meetingList.forEach( function(element, index, array) {
            speechText += "Reunión: " + element + ". ";
          });
      }

       return handlerInput.responseBuilder
           .speak(speechText)
           .reprompt(speechText)
           .getResponse();
   }
};

const StartedInProgressDeleteMeetingIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "DeleteMeetingIntent" &&
            handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {

        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }
};

const DeleteMeetingIntentHandler = {
  canHandle(handlerInput) {
    console.log("Input: " + JSON.stringify(handlerInput.requestEnvelope));
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "DeleteMeetingIntent"
      && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';

  },
  handle(handlerInput) {

    let value = handlerInput.requestEnvelope.request.intent.slots.meetingName.value;
    let resolutions = handlerInput.requestEnvelope.request.intent.slots.meetingName.resolutions;

    if (!isEmpty(resolutions)) {
      resolutions.resolutionsPerAuthority.forEach(function(element, index, array){
        if (!isEmpty(element.values)) {
          value += " con identificador: " + JSON.stringify(element.values);
        }
      });
    }

    let speechText = "";

    if ( !isEmpty(value) ) {
      speechText += "Eliminando reunión " + value;
    }
    else {
      speechText += "Hm...no recibí el meeting";
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
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
const IntentReflectorHandler = {
   canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest';
   },
   handle(handlerInput) {
       const intentName = handlerInput.requestEnvelope.request.intent.name;
       const speechText = `Evento no capturado... ${intentName}`;

       return handlerInput.responseBuilder
           .speak(speechText)
           //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
           .getResponse();
   }
};
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


function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

exports.handler = Alexa.SkillBuilders.custom()
   .addRequestHandlers(
       LaunchRequestHandler,
       CreateMeetingIntentHandler,
       ListMeetingIntentHandler,
       StartedInProgressDeleteMeetingIntentHandler,
       DeleteMeetingIntentHandler,
       HelpIntentHandler,
       CancelAndStopIntentHandler,
       SessionEndedRequestHandler,
       IntentReflectorHandler)
   .addErrorHandlers(
       ErrorHandler)
  //.withTableName("NewMeeting")
   .lambda();
