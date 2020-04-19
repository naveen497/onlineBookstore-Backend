import express from "express";
import Joi from "joi";
import User from "../models/user.schema";
import {signIn} from "../validations/user";
import {parseError, sessionizeUser} from "../util/helper";
import {SESS_NAME} from "../config";

const sessionRouter = express.Router();

sessionRouter.post("", async (req, res) => {
    try {
        const {email, password} = req.body
        await Joi.validate({email, password}, signIn);
        const user = await User.findOne({email});
        if (user && user.comparePasswords(password)) {
            const sessionUser = sessionizeUser(user);
            console.log('in sign : session')
            console.log(sessionUser)
            req.session.user = sessionUser
            console.log('session.user')
            console.log(req.session.user)
            res.send(sessionUser);
        } else {
            throw new Error('Invalid login credentials');
        }
    } catch (err) {
        res.status(401).send(parseError(err));
    }
});

sessionRouter.delete("", ({session}, res) => {
    try {
        const user = session.user;
        if (user) {
            session.destroy(err => {
                if (err) {
                    throw (err);
                }
                res.clearCookie(SESS_NAME);
                res.send(user);
            });
        } else {
            throw new Error('Something went wrong');
        }
    } catch (err) {
        res.status(422).send(parseError(err));
    }
});

sessionRouter.get("", ({session}, res) => {
    console.log("getting the session")
    console.log(session)
    console.log('===========')
    console.log(session.user)
    const user = session.user
    return res.send({user});
});

export default sessionRouter;
