import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess();
const bucketName = process.env.IMAGES_S3_BUCKET

export async function createTodo(todo): Promise<TodoItem> {
    todo.createdAt = new Date().toISOString()
    todo.done = false
    todo.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todo.todoId}`
    return await todoAccess.createTodo(todo);
}

export async function deleteTodo(todoId, userId) {
    return await todoAccess.deleteTodo(todoId, userId)
}

export async function getTodos(userId) {
    return await todoAccess.getTodos(userId)
}

export async function updateTodo(todoId: String, userId: String, updateTodo: UpdateTodoRequest){
    return await todoAccess.updateTodo(todoId, userId, updateTodo)
}
