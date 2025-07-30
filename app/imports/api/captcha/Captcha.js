import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { check } from "meteor/check";

/** Define a Mongo collection to hold the data. */
const Captcha = new Mongo.Collection("Captcha");

/** Define a Joi schema to specify the structure of each document in the collection. */
const CaptchaSchema = Joi.object({
  _id: Joi.string().required(),
  text: Joi.string().required(),
  timestamp: Joi.date().required(),
  solved: Joi.boolean().required(),
  used: Joi.boolean().required(),
});

async function isCaptchaSolved(sessionId) {
  check(sessionId, String);

  // Always perform database lookup to maintain constant timing
  const session = await Captcha.findOneAsync({ _id: sessionId });

  // Use constant-time evaluation to prevent timing attacks
  let isValid = false;
  let isSolved = false;
  let isUsed = true; // Default to used for security

  if (session) {
    isSolved = session.solved === true;
    isUsed = session.used === true;
  }

  // Constant-time boolean evaluation
  isValid = isSolved && !isUsed;

  // Add small random delay to further obfuscate timing
  const delay = Math.floor(Math.random() * 5) + 1; // 1-5ms
  await new Promise(resolve => {
    setTimeout(resolve, delay);
  });

  return isValid;
}

async function useCaptcha(sessionId) {
  check(sessionId, String);

  // Use atomic update to prevent race conditions
  const result = await Captcha.updateAsync(
    {
      _id: sessionId,
      solved: true,
      used: false,
    },
    {
      $set: { used: true },
    },
  );

  // Return whether the update was successful (captcha was available to use)
  return result > 0;
}

/** Make the collection and schema available to other code. */
export { Captcha, CaptchaSchema, isCaptchaSolved, useCaptcha };
