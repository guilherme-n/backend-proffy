import { Request, Response } from 'express';
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

export default class ClassesController {
	async index(request: Request, response: Response): Promise<any> {
		const filters = request.query;
		const { week_day, subject, time } = filters;

		if (!week_day || !subject || !time) {
			return response.status(400).json({
				error: 'Missing filter to search classes',
			});
		}

		const minutes = convertHourToMinutes(time as string);

		const classes = await db
			.from('classes')
			.innerJoin('class_schedule', 'classes.id', 'class_schedule.class_id')
			.innerJoin('users', 'users.id', 'classes.user_id')
			.where({
				week_day: filters.week_day,
				subject: filters.subject,
			})
			.where('from', '<=', minutes)
			.where('to', '>', minutes);

		return response.json(classes);
	}

	async create(request: Request, response: Response): Promise<any> {
		const {
			name,
			avatar,
			whatsapp,
			bio,
			subject,
			cost,
			schedule,
		} = request.body;

		const trx = await db.transaction();

		try {
			const insertedUsersIds = await trx('users').insert({
				name,
				avatar,
				whatsapp,
				bio,
			});
			const user_id = insertedUsersIds[0];

			const insertedClassesIds = await trx('classes').insert({
				subject,
				cost,
				user_id,
			});
			const class_id = insertedClassesIds[0];

			const classSchedule = schedule.map((item: scheduleItem) => {
				return {
					class_id,
					week_day: item.week_day,
					from: convertHourToMinutes(item.from),
					to: convertHourToMinutes(item.to),
				};
			});

			await trx('class_schedule').insert(classSchedule);

			await trx.commit();
			return response.status(201).send();
		} catch (err) {
			console.log(err);
			trx.rollback();
			return response.status(400).json({
				error: 'Unexpected error while create a new class',
			});
		}
	}
}

interface scheduleItem {
	week_day: number;
	from: string;
	to: string;
}
