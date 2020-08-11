// Test PizzaProfile

const { MessageFactory } = require('botbuilder');
const {
    ChoiceFactory,
    ChoicePrompt,
    ConfirmPrompt,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');
const { ToppingsDialog, TOPPINGS_DIALOG } = require('./toppingsDialog');
const { PizzaProfile } = require('../pizzaProfile');

const INITIAL_PROMPT = 'INITIAL_PROMPT';
const TYPE_PROMPT = 'TYPE_PROMPT';
const TOPPINGS_PROMPT = 'TOPPINGS_PROMPT';
const ADDRESS_PROMPT = 'ADDRESS_PROMPT';
const PIZZA_PROFILE = 'PIZZA_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserProfileDialog extends ComponentDialog {
    constructor(userState) {
        super('userProfileDialog');

        this.userProfile = userState.createProperty(PIZZA_PROFILE);

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

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async askStep(step) {
        return await step.prompt(INITIAL_PROMPT, 'My name is PizzaBot, how can I help?');
    }

    async parseStep(step) {
        var args = step.result.split(" ");

        // IF USING NLP, DIFFERENT TYPES OF ARGUMENTS WILL HAVE A TYPE, IN THIS CASE WE ARE "HARDCODING" IT
        args.forEach(function(arg) {
            if (arg.includes("type:")) {
                step.values.typePizza = arg.replace('type:', '');
            }
            else if (arg.includes("topping:")) {
                step.values.toppings = arg.replace('topping:', '');
            }
            else if (arg.includes("address:")) {
                step.values.address = arg.replace('address:', '');
            }
        });
        console.log(step.values);
        return await step.next();

        //step.values.typePizza = step.result.value;
        //return await step.prompt(TOPPINGS_PROMPT, 'What toppings would you like?');

    }

    async typeStep(step) {
        //step.values.toppings = step.result;
        //return await step.prompt(CONFIRM_PROMPT, "Would you like anymore toppings?");
        //return await step.next();
        if (!step.values.typePizza) {
            return await step.prompt(TYPE_PROMPT, 'You didn\'t tell me what type of pizza you would like. What type of pizza would you like?');
        }
        else {
            return await step.next();
        }

    }

    async toppingsStep(step) {
        console.log("in toppings step");
        if (step.result) {
            step.values.typePizza = step.result;
        }
        //console.log(await step.beginDialog(new ToppingsDialog()));
        return await step.beginDialog(TOPPINGS_DIALOG);

        // if (!step.values.toppings) {
        //     return await step.prompt(TOPPINGS_PROMPT, 'You didn\'t tell me what topping you would like. What topping would you like?');
        // }
        // else {
        //     return await step.next();
        // }
    }

    async addressStep(step) {
        if (step.result) {
            step.values.toppings = step.result;
        }

        if (!step.values.address) {
            return await step.prompt(ADDRESS_PROMPT, 'You didn\'t tell me your address. What is your address?');
        }
        else {
            return await step.next();
        }
    }

    async summaryStep(step) {
        if (step.result) {
            step.values.address = step.result;
        }

        console.log("Got to summaryStep");

        const userProfile = await this.userProfile.get(step.context, new PizzaProfile());

        userProfile.typePizza = step.values.typePizza;
        userProfile.toppings = step.values.toppings;
        userProfile.address = step.values.address;

        let msg = `Your order of a ${ userProfile.typePizza } pizza with `;
        //for (var i = 0; i < userProfile.toppings.length; i++) {
            msg += `${ userProfile.toppings }, `;
            //if (i === userProfile.toppings.length - 1 && userProfile.toppings.length > 2) {
                //msg += `and ${ userProfile.toppings[i] }`;
            //}
        //}
        msg += `will be delivered to ${ userProfile.address }.`

        await step.context.sendActivity(msg);

        return await step.endDialog();
    }
}

module.exports.UserProfileDialog = UserProfileDialog;
