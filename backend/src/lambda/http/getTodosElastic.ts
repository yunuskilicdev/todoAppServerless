import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getHeaders } from '../utils'

import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ELASTICSEARCH_URL
const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryWord = event.queryStringParameters["query"]
    const userId = event.requestContext.authorizer.principalId;
    const result = await es.search({
        index: 'todo-index',

        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "name": queryWord
                            }
                        },
                        {
                            "match": {
                                "userId": userId
                            }
                        }
                    ]
                }
            }
        }
    })

    let response = []
    try {
        response = result.hits.hits[0]._source;
    } catch (error) {
        response = []
    }

    return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
            response
        })
    }
}