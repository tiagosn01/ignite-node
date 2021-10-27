import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListSpecificationUseCase } from "./ListSpecificationUseCase";

class ListSpecificationController {
  async handle(request: Request, response: Response): Promise<Response> {
    const listSpecificationUseCase = container.resolve(
      ListSpecificationUseCase
    );
    const listCategories = await listSpecificationUseCase.execute();

    return response.status(200).json(listCategories);
  }
}

export { ListSpecificationController };
