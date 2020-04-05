import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createTodo } from '../../businessLayer/Todo'
import { createLogger } from '../../utils/logger'
import { getHeaders } from '../utils'
import * as uuid from 'uuid'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('lambda-create-todo')
const snsArn = process.env.SNS_ARN


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken);

    let todo = {
      todoId: uuid.v4(),
      userId,
      name: newTodo.name,
      dueDate: newTodo.dueDate
    }

    const newTodoResponse = await createTodo(todo);

    const snsClient = new XAWS.SNS();
    var params = {
        Message: JSON.stringify(todo), 
        Subject: "TODO_CREATED",
        TopicArn: snsArn
    };
    await snsClient.publish(params).promise();    
    return {
      statusCode: 201,
      headers: getHeaders(),
      body: JSON.stringify({
        item: newTodoResponse
      })
    }
  } catch (error) {
    logger.error(error.errorMessage)
    console.log(error)
    return {
      statusCode: 500,
      headers: getHeaders(),
      body: "Todo could not created"
    }
  }
}
