import { Router } from "express";

import { CategoriesRepository } from "../repositories/CategoriesRepository";
import { CreateCategoryService } from "../services/CreateCategoryService";

const categoriesRoutes = Router();
const categoriesRepository = new CategoriesRepository();

categoriesRoutes.post("/", (req, res) => {
  const { name, description } = req.body;

  const createCategorySerice = new CreateCategoryService(categoriesRepository);
  createCategorySerice.execute({ name, description });
  return res.status(201).send();
});

categoriesRoutes.get("/", (req, res) => {
  const listCategories = categoriesRepository.list();

  return res.status(201).json(listCategories);
});

export { categoriesRoutes };
