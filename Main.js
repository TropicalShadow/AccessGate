const Authentication = require('./src/authentication.js'); // Ensure the path is correct
const Session = require('./src/session.js'); // Ensure the path is correct

module.exports = function (app) {
    // Application API
    app.post('/accessgate/api/application/authentication/:platform/login', (req, res) => {
        const auth = new Authentication(req, res);
        auth.login();
    });

    app.post('/accessgate/api/application/authentication/:platform/license', (req, res) => {
        const auth = new Authentication(req, res);
        auth.licenses();
    });

    app.post('/accessgate/api/application/authentication/:platform/license', (req, res) => {
        const auth = new Authentication(req, res);
        auth.licenses();
    });

    app.post('/accessgate/api/application/authentication/:platform/logout', (req, res) => {
        const auth = new Authentication(req, res);
        auth.logoutforce();
    });

    app.post('/accessgate/api/application/authentication/:platform/session', (req, res) => {
        const session = new Session(req, res);
        session.validSession();
    });

    

    console.log("Net.HetMasterTje Loaded");
};
