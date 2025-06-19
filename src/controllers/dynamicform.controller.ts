import { Request, Response, NextFunction } from 'express';
import { DynamicFormDto } from '../dtos/dynamicform.dto';
import DynamicFormService from '../services/dynamicform.service';

class DynamicFormController {
    public dynamicFormService = new DynamicFormService();

    public insertForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const formData: DynamicFormDto = req.body;
            const inserted = await this.dynamicFormService.insertForm(formData);
            res.status(201).json({ data: inserted, message: "Form inserted" });
        } catch (error) {
            next(error);
        }
    };

    public getAllActiveForms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const forms = await this.dynamicFormService.getAllActiveForms();
            res.status(200).json({ data: forms, message: "Fetched active forms" });
        } catch (error) {
            next(error);
        }
    };

    public getFormById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {
            const { id } = req.body;
            if (!id) {
                res.status(400).json({ message: "ID is required" });
                return;
            }

            const form = await this.dynamicFormService.getFormById(id);
            if (!form) {
                res.status(404).json({ message: "Form not found" });
                return;
            }

            res.status(200).json({ data: form, message: "Form fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const formData = req.body;
            if (!formData.id) {
                res.status(400).json({ message: "ID is required" });
                return;
            }
            if (!formData.form_title || !formData.form_data) {
                res.status(400).json({ message: "Form title and form data are required" });
                return;
            }
            const updatedForm = await this.dynamicFormService.updateForm(formData.id, formData);
            if (!updatedForm) {
                res.status(404).json({ message: "Form not found" });
                return;
            }
            res.status(200).json({ data: updatedForm, message: "Form updated successfully" });

        } catch (error) {
            next(error);
        }
    };

    public DeleteForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const formData = req.body;
            if (!formData.id) {
                res.status(400).json({ message: "ID is required" });
                return;
            }
            const updatedForm = await this.dynamicFormService.DeleteMyForm(formData.id, formData);
            if (!updatedForm) {
                res.status(404).json({ message: "Form not found" });
                return;
            }
            res.status(200).json({ data: updatedForm, message: "Form Deleted successfully" });

        } catch (error) {
            next(error);
        }
    }
}

export default DynamicFormController;
