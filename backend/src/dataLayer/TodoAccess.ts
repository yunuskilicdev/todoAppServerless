import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME
  ) {

  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    })
      .promise()
    return todoItem
  }

  async deleteTodo(todoId: String, userId: String) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise();
  }

  async getTodos(userId: String): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();
    const items = result.Items
    return items as TodoItem[]
  }

  async updateTodo(todoId: String, userId: String, updatedTodo: UpdateTodoRequest) {
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: "set #name = :n, #dueDate = :d, #done = :t",
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ":n": updatedTodo.name,
        ":d": updatedTodo.dueDate,
        ":t": updatedTodo.done
      },
      ReturnValues: "UPDATED_NEW"
    };
    const updated = await this.docClient.update(params).promise();
    console.log(updated)
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}