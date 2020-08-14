const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

const TOPPINGS_DIALOG = 'TOPPINGS_DIALOG';

const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ToppingsDialog extends ComponentDialog {
    constructor(userState) {
        super(TOPPINGS_DIALOG);

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG), [
            this.toppingsStep.bind(this),
            this.goBackStep.bind(this)
        ]);

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async toppingsStep(step) {
        console.log("toppingsStep finally?");
        return await step.prompt(TEXT_PROMPT, "toppingStep");
    }

    async goBackStep(step) {
        const toppingList = step.values;
        console.log("made it to go back step");
        return await step.endDialog(toppingList);
    }
}

module.exports.ToppingsDialog = ToppingsDialog;
module.exports.TOPPINGS_DIALOG = TOPPINGS_DIALOG;
