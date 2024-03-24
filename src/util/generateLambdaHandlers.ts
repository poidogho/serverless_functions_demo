import { APIGatewayEvent, Handler } from 'aws-lambda';
import { ZodType } from 'zod';
import {
  HandlerCallback,
  HandlerHttpRequestType,
  HandlerOutput,
} from './types';
import { parseAPIGatewayEventBody } from './eventParser';
import { jsonResp } from './responseHelpers';
import LoggerService from './logger';

const logger = LoggerService.getInstance();

export interface GenerateAPIGatewayEventHandlerOptions {
  waitForEventLoop: boolean;
}

export const defaultGenerateAPIGatewayEventHandlerOptions: GenerateAPIGatewayEventHandlerOptions =
  {
    waitForEventLoop: true,
  };

/**
 * generates the glue code around your HandlerCallbacks to ease development
 * @param requestType the kind of http request that is expected for this endpoint
 * @param handler your handler code
 * @param inputValidator the expected input validator that generates valid input from an APIGatewayEvent to pass to handler
 * @param options options for controlling things like waiting for the empty event loop
 */
export function generateAPIGatewayEventHandler<InputType>(
  requestType: HandlerHttpRequestType,
  handler: HandlerCallback<InputType>,
  inputValidator: ZodType<InputType>,
  options?: GenerateAPIGatewayEventHandlerOptions
): Handler<APIGatewayEvent, HandlerOutput> {
  const validatedOptions =
    options ?? defaultGenerateAPIGatewayEventHandlerOptions;

  return async (event, context): Promise<HandlerOutput> => {
    // this is here to not have the handler get stuck waiting for knex to die
    context.callbackWaitsForEmptyEventLoop = validatedOptions.waitForEventLoop;

    try {
      // To verify the request we call safeParse on the JSON.parse result of our helper function parseAPIGatewayEventBody
      // safeParse will return either a success or failure object if the input matched our schema
      const inputResult = inputValidator.safeParse(
        parseAPIGatewayEventBody(event, requestType)
      );

      if (!inputResult.success) {
        logger.warn('Request input failed to parse', {
          validatorMessage: inputResult.error.toString(),
        });

        return jsonResp(400, {
          message: 'Invalid input processing request',
          errors: inputResult.error,
        });
      }

      return await handler(inputResult.data);
    } catch (error) {
      logger.error('Top level error handler', { error });

      return jsonResp(500, {
        message: 'An internal server error occurred!',
      });
    }
  };
}
