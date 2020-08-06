import { Request, Response } from 'express';
import db from '../database/connection';

export default class UsersController {
	async index(request: Request, response: Response): Promise<any> {
		return response.json(await db.from('users'));
	}
}
