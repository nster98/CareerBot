// Test PizzaProfile

//const { MessageFactory } = require('botbuilder');
const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
//const { Channels } = require('botbuilder-core');
const { ToppingsDialog, TOPPINGS_DIALOG } = require('./toppingsDialog');
const { PizzaProfile } = require('../pizzaProfile');

const USER_PIZZA_DIALOG = 'USER_PIZZA_DIALOG'
const INITIAL_PROMPT = 'INITIAL_PROMPT';
const TYPE_PROMPT = 'TYPE_PROMPT';
const TOPPINGS_PROMPT = 'TOPPINGS_PROMPT';
const ADDRESS_PROMPT = 'ADDRESS_PROMPT';
const PIZZA_PROFILE = 'PIZZA_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserPizzaDialog extends ComponentDialog {
    constructor(userState) {
        super(USER_PIZZA_DIALOG);

        // this.userState = userState;
        // this.userProfile = userState.createProperty(PIZZA_PROFILE);

        this.addDialog(new ToppingsDialog());

        this.addDialog(new TextPrompt(INITIAL_PROMPT));
        this.addDialog(new TextPrompt(TYPE_PROMPT));
        this.addDialog(new TextPrompt(TOPPINGS_PROMPT));
        this.addDialog(new TextPrompt(ADDRESS_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.askStep.bind(this),
            this.parseStep.bind(this),
            this.typeStep.bind(this),
            this.toppingsStep.bind(this),
            this.addressStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async askStep(stepContext) {
        console.log("now in userPizzaDialog");
        return await stepContext.prompt(INITIAL_PROMPT, 'My name is PizzaBot, how can I help?');
    }

    async parseStep(stepContext) {
        var args = stepContext.result.split(" ");

        // IF USING NLP, DIFFERENT TYPES OF ARGUMENTS WILL HAVE A TYPE, IN THIS CASE WE ARE "HARDCODING" IT
        args.forEach(function(arg) {
            if (arg.includes("type:")) {
                stepContext.values.typePizza = arg.replace('type:', '');
            }
            else if (arg.includes("topping:")) {
                stepContext.values.toppings = arg.replace('topping:', '');
            }
            else if (arg.includes("address:")) {
                stepContext.values.address = arg.replace('address:', '');
            }
        });
        console.log(stepContext.values);
        return await stepContext.next();

        //stepContext.values.typePizza = stepContext.result.value;
        //return await stepContext.prompt(TOPPINGS_PROMPT, 'What toppings would you like?');

    }

    async typeStep(stepContext) {
        //stepContext.values.toppings = stepContext.result;
        //return await stepContext.prompt(CONFIRM_PROMPT, "Would you like anymore toppings?");
        //return await stepContext.next();
        if (!stepContext.values.typePizza) {
            return await stepContext.prompt(TYPE_PROMPT, 'You didn\'t tell me what type of pizza you would like. What type of pizza would you like?');
        }
        else {
            return await stepContext.next();
        }

    }

    async toppingsStep(stepContext) {
        console.log("in toppings stepContext");
        if (stepContext.result) {
            stepContext.values.typePizza = stepContext.result;
        }
        //console.log(await stepContext.beginDialog(new ToppingsDialog()));
        //return await stepContext.beginDialog(TOPPINGS_DIALOG);
        if (!stepContext.values.toppings) {
            return await stepContext.prompt(TOPPINGS_PROMPT, 'You didn\'t tell me what topping you would like. What topping would you like?');
        }
        else {
            return await stepContext.next();
        }
    }

    async addressStep(stepContext) {
        if (stepContext.result) {
            stepContext.values.toppings = stepContext.result;
        }

        if (!stepContext.values.address) {
            return await stepContext.prompt(ADDRESS_PROMPT, 'You didn\'t tell me your address. What is your address?');
        }
        else {
            return await stepContext.next();
        }
    }

    async summaryStep(stepContext) {
        if (stepContext.result) {
            stepContext.values.address = stepContext.result;
        }

        console.log("Got to summaryStep");

        //const userProfile = await this.userProfile.get(stepContext.context, new PizzaProfile());

        // userProfile.typePizza = stepContext.values.typePizza;
        // userProfile.toppings = stepContext.values.toppings;
        // userProfile.address = stepContext.values.address;

        let msg = `Your order of a ${ stepContext.values.typePizza } pizza with `;
        //for (var i = 0; i < userProfile.toppings.length; i++) {
            msg += `${ stepContext.values.toppings }, `;
            //if (i === userProfile.toppings.length - 1 && userProfile.toppings.length > 2) {
                //msg += `and ${ userProfile.toppings[i] }`;
            //}
        //}
        msg += `will be delivered to ${ stepContext.values.address }.`

        await stepContext.context.sendActivity(msg);

        return await stepContext.endDialog();
    }
}

module.exports.UserPizzaDialog = UserPizzaDialog;
module.exports.USER_PIZZA_DIALOG = USER_PIZZA_DIALOG;
