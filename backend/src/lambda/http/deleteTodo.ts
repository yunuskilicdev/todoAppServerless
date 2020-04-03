import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteTodo } from '../../businessLayer/Todo';
import { parseUserId } from '../../auth/utils';
import { getHeaders } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('lambda-delete-todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken);

    await deleteTodo(todoId, userId);
    return {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
      })
    }
  } catch (error) {
    logger.error(error.errorMessage)
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: "Todo could not deleted"
    }
  }

}
