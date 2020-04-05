import { SNSEvent, SNSHandler } from 'aws-lambda'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ELASTICSEARCH_URL

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})
export const handler: SNSHandler = async (event: SNSEvent) => {
    for (const snsRecord of event.Records) {
        const todo = JSON.parse(snsRecord.Sns.Message)

        await es.index({
            index: 'todo-index',
            id: todo.todoId,
            body: {
                userId: todo.userId,
                todoId: todo.todoId,
                createdAt: todo.createdAt,
                name: todo.name,
                dueDate: todo.dueDate,
                done: todo.done,
                attachmentUrl: todo.attachmentUrl
            }
        })
    }
    await es.indices.refresh({ index: 'todo-index' })
}

