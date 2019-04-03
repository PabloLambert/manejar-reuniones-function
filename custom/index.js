const Alexa = require('ask-sdk');
const uuid = require('uuid');

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
      addMeeting(session.meetingList, value);
      console.log("meetingList: " + JSON.stringify(session.meetingList));
      handlerInput.attributesManager.setSessionAttributes(session);

      const meetingNamesEntities = getDynamicEntities(session.meetingList);

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
            speechText += "Reunión: " + element.name + ". ";
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

    const session = handlerInput.attributesManager.getSessionAttributes();

    let isFound = false;

    if (!isEmpty(resolutions)) {
      resolutions.resolutionsPerAuthority.forEach(function(element, index, array){
        if (!isEmpty(element.values) && !isEmpty(element.values.value)) {
          if ( deleteMeeting(session.meetingList, element.values.value.id ) ) {
            isFound = true;
          }
        }
      });
    }

    handlerInput.attributesManager.setSessionAttributes(session);
    const meetingNamesEntities = getDynamicEntities(session.meetingList);

    let speechText = "";

    if (isFound) {
      speechText += "Eliminando reunión " + value;
    } else {
      speechText += "Hm...no encontré el meeting";
    }

    return handlerInput.responseBuilder
      .addDirective(meetingNamesEntities)
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

function addMeeting( meetingList, meetingName) {
  if ( meetingList != null ) {
    meetingList.push( {
      'name': meetingName,
      'id': uuid.v1()
    });
  }
}

function deleteMeeting(meetingList, meetingId) {
  if (!isEmpty(meetingList)) {
    meetingList.forEach(function(element, index, array) {
      if ( element.id === meetingId ) {
          meetingList.splice(index, 1);
          return true;
      }
    });
  }
  return false;
}

function getDynamicEntities(meetingList) {
  const entities = [];

  if (! isEmpty (meetingList )) {
    meetingList.forEach( function(element, index, array) {
      entities.push({
        "id": element.id,
        "name" : {
          "value": element.name,
          "synonyms" : []
        }
      });
    });
  }

  return  {
    type: "Dialog.UpdateDynamicEntities",
    updateBehavior: "REPLACE",
    types: [
      {
        name: "meetingNameType",
        values: entities
      }
    ]
  };
}


function isEmpty(val) {
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
