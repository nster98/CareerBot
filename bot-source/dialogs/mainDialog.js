const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { UserPizzaDialog, USER_PIZZA_DIALOG } = require('./userPizzaDialog');
const { ToppingsDialog, TOPPINGS_DIALOG } = require('./toppingsDialog');


const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const PIZZA_PROFILE = 'PIZZA_PROFILE';

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);

        this.userState = userState;
        this.userProfile = userState.createProperty(PIZZA_PROFILE);

        this.addDialog(new UserPizzaDialog());
        this.addDialog(new ToppingsDialog());
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        console.log("in main dialog?");
        return await stepContext.beginDialog(USER_PIZZA_DIALOG);
    }

    async finalStep(stepContext) {
        console.log("Finished context");
        return await stepContext.endDialog();
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
