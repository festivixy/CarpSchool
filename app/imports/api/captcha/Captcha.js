import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold the data. */
const Captcha = new Mongo.Collection('Captcha');

/** Define a Joi schema to specify the structure of each document in the collection. */
const CaptchaSchema = Joi.object({
  _id: Joi.string().required(),
  text: Joi.string().required(),
  timestamp: Joi.date().required(),
  solved: Joi.boolean().required(),
  used: Joi.boolean().required(),
});

async function isCaptchaSolved(sessionId) {
  const session = await Captcha.findOneAsync({ _id: sessionId });
  return session && session.solved && !session.used;
}

async function useCaptcha(sessionId) {
  const session = await Captcha.findOneAsync({ _id: sessionId });
  await Captcha.updateAsync(session, {
    text: session.text,
    timestamp: session.timestamp,
    solved: session.solved,
    used: true,
  });
}

/** Make the collection and schema available to other code. */
export { Captcha, CaptchaSchema, isCaptchaSolved, useCaptcha };
