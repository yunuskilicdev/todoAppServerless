import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createTodo } from '../../businessLayer/Todo'
import { createLogger } from '../../utils/logger'
import { getHeaders } from '../utils'

const logger = createLogger('lambda-create-todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken);

    let todo = {
      userId,
      name: newTodo.name,
      dueDate: newTodo.dueDate
    }

    const newTodoResponse = await createTodo(todo);
    return {
      statusCode: 201,
      headers: getHeaders(),
      body: JSON.stringify({
        item: newTodoResponse
      })
    }
  } catch (error) {
    logger.error(error.errorMessage)
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: "Todo could not created"
    }
  }
}
