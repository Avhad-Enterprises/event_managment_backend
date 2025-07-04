import { NextFunction, Request, Response } from "express";
import { TagsDto } from "../dtos/tags.dto";
import TagsService from "../services/tags.service";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";

class TagsController {
    public TagsService = new TagsService();

    public insertTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagData: TagsDto = req.body;
            const insertedTag = await this.TagsService.InsertTag(tagData);
            res.status(201).json({ data: insertedTag, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    };

    public getTagsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.TagsService.GetTagsByType("events");
            res.status(200).json({ data: tags, message: "Fetched tags of type 'events'" });
        } catch (error) {
            next(error);
        }
    };

}

export default TagsController;
