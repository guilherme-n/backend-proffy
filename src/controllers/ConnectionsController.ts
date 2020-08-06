import { Request, Response } from 'express';
import db from '../database/connection';

export default class ConnectionsController {
	async index(request: Request, response: Response): Promise<any> {
		return response.json(await db('connections'));
	}

	async create(request: Request, response: Response): Promise<any> {
		const { user_id } = request.body;
		console.log(user_id);

		await db('connections').insert({ user_id });

		return response.status(201).send();
	}
}
