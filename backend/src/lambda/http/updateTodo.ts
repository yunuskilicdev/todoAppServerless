import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getHeaders } from '../utils'
import { updateTodo } from '../../businessLayer/Todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('lambda-update-todo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = event.requestContext.authorizer.principalId;

    await updateTodo(todoId, userId, updatedTodo)
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
      body: "Todo could not updated"
    }
  }
}
