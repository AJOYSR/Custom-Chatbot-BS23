import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export class BaseRepository<T extends Document> {
	constructor(private readonly model: Model<T>) {}

	async create(data: Partial<T>): Promise<T> {
		const entity = new this.model(data);
		return entity.save();
	}

	async findOne(filter: FilterQuery<T>): Promise<T | null> {
		return this.model.findOne(filter);
	}

	async findById(id: string): Promise<T | null> {
		return this.model.findById(id);
	}

	async find(filter: FilterQuery<T>): Promise<T[]> {
		return this.model.find(filter);
	}

	async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
		return this.model.findByIdAndUpdate(id, data, { new: true });
	}

	async delete(id: string): Promise<T | null> {
		return this.model.findByIdAndDelete(id);
	}
}
