import { DynamicFormDto } from '../dtos/dynamicform.dto';
import DB, { T } from "../database/index.schema";
import { isEmpty } from '../utils/util';
import HttpException from '../exceptions/HttpException';

class DynamicFormService {
    public async insertForm(data: DynamicFormDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Form data is empty");
        }
        const [inserted] = await DB(T.DYNAMIC_FORMS_TABLE).insert({
            ...data,
            form_data: data.form_data,
        }).returning("*");

        return inserted;
    }

    public async getAllActiveForms(): Promise<any[]> {
        const forms = await DB(T.DYNAMIC_FORMS_TABLE)
            .select('*')
            .where('is_deleted', false)
            .orderBy('created_at', 'desc');
        return forms;
    }

    public async getFormById(id: number): Promise<any> {
        const form = await DB(T.DYNAMIC_FORMS_TABLE)
            .select('*')
            .where('id', id)
            .andWhere('is_deleted', false)
            .first();
        if (!form) {
            throw new HttpException(404, "Form not found");
        }
        return form;
    }

    public async updateForm(id: number, data: Partial<DynamicFormDto>): Promise<any> {
        if (!id) throw new HttpException(400, "Form ID is required");
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");
        const formExists = await DB(T.DYNAMIC_FORMS_TABLE)
            .select('*')
            .where('id', id)
            .andWhere('is_deleted', false)
            .first();
        if (!formExists) {
            throw new HttpException(404, "Form not found");
        }
        const [updatedForm] = await DB(T.DYNAMIC_FORMS_TABLE)
            .where('id', id)
            .update(data)
            .returning("*");
        if (!updatedForm) throw new HttpException(404, "Form not updated");

        return updatedForm;
    }

    public async DeleteMyForm(id: number, data: Partial<DynamicFormDto>): Promise<any> {
        if (!id) throw new HttpException(400, "Form ID is required");
        if (isEmpty(data)) throw new HttpException(400, "data is empty");
        const formExists = await DB(T.DYNAMIC_FORMS_TABLE)
            .select('*')
            .where('id', id)
            .andWhere('is_deleted', false)
            .first();
        if (!formExists) {
            throw new HttpException(404, "Form not found");
        }
        const [updatedForm] = await DB(T.DYNAMIC_FORMS_TABLE)
            .where('id', id)
            .update(data)
            .returning("*");
        if (!updatedForm) throw new HttpException(404, "Form not Delted");

        return updatedForm;
    }

}

export default DynamicFormService;
