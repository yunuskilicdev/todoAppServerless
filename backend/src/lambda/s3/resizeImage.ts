import { SNSEvent, SNSHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'
import { createLogger } from '../../utils/logger'
const logger = createLogger('lambda-s3-resize-image')
import { TodoAccess } from '../../dataLayer/todoAccess'

const s3 = new AWS.S3()

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info(`Processing SNS event ${JSON.stringify(event)}`)
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    const s3Event = JSON.parse(s3EventStr)
    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record) {
  const key = record.s3.object.key
  logger.info(`Processing S3 item with key: ${key}`)
  const response = await s3
    .getObject({
      Bucket: imagesBucketName,
      Key: key
    })
    .promise()

  const body = response.Body as Buffer
  const image = await Jimp.read(body)

  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
  
  await s3
    .putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    })
    .promise()

    const todoAcccess = new TodoAccess();
    const result = todoAcccess.getTodoById(key)
    let todo = result[0]

    todoAcccess.updateAttachment(todo.todoId,todo.userId, `https://${thumbnailBucketName}.s3.amazonaws.com/${key}.jpeg`)
}
