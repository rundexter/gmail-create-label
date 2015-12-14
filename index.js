var _ = require('lodash'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

  var inpData = ['name', 'labelListVisibility', 'messageListVisibility'];

module.exports = {
    checkAuthOptions: function (step, dexter) {

        if(!step.input('userId').first()) {

            this.fail('A userId input variable is required for this module');
        }

        if(!dexter.environment('google_access_token') || !dexter.environment('google_refresh_token')) {

            this.fail('A google_access_token,google_refresh_token environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        this.checkAuthOptions(step, dexter);

        var oauth2Client = new OAuth2();
        oauth2Client.setCredentials({access_token: dexter.environment('google_access_token'), refresh_token: dexter.environment('google_refresh_token')});

        var formData = {};

        _.map(inpData, function (attrName) {
          if (step.input(attrName).first() !== null)
            formData[attrName] = _(step.input(attrName).first()).toString().trim();
        });

        google.options({ auth: oauth2Client });
        google.gmail('v1').users.labels.create({
            auth: oauth2Client,
            userId: step.input('userId', null).first(),
            resource: formData
          }, function (err, message) {

            err? this.fail(err) : this.complete(message);
        }.bind(this));

    }
};
