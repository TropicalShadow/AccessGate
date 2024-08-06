import {Authentication} from './authentication'
import {Session} from './session'
import { Express } from "express";

export function registerRoutes(app: Express): void {
    app.post('/api/login/:platform/', (req, res) => {
        const auth = new Authentication(req, res);
        auth.login();
    });

    app.post('/api/license/:platform/', (req, res) => {
        const auth = new Authentication(req, res);
        auth.licenses();
    });

    app.post('/api/logout/:platform/', (req, res) => {
        const auth = new Authentication(req, res);
        console.log(auth);
        /* auth.logoutforce(); */
    });

    app.post('/api/session/:platform/', (req, res) => {
        const session = new Session(req, res);
        session.validSession();
    });
}