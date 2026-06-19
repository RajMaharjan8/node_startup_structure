import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import { PackageResponse } from "../resources/package.resource";
import {
  getPackages,
  findPackage,
  createPackage,
  updatePackage,
  deletePackage,
} from "../servers/package.service";

const listPackages =
  (activeOnly: boolean) => async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page ?? 1);
      const perPage = Number(req.query.per_page ?? 10);
      const skip = (page - 1) * perPage;
      const keyword = String(req.query.keyword ?? "");
      const sortBy = req.query.sort_by === "asc" ? "asc" : "desc";

      const { packages, total } = await getPackages(
        perPage,
        skip,
        keyword || null,
        sortBy,
        activeOnly,
      );

      return sendResponse(res, "Packages Fetched Successfully", {
        data: packages.map(PackageResponse),
        pagination: {
          total,
          per_page: perPage,
          current_page: page,
          total_pages: Math.ceil(total / perPage),
        },
      });
    } catch (err: any) {
      console.log(err);
      return sendResponseFail(res, "Something Went Wrong", {}, 500);
    }
  };

export const getPackagesPublic = listPackages(true);
export const getPackagesAdmin = listPackages(false);

export const showPackage = async (req: Request, res: Response) => {
  try {
    const pkg = await findPackage(Number(req.params.id));
    if (!pkg) return sendResponse(res, "Package Not Found", [], 404);
    return sendResponse(res, "Package Fetched Successfully", PackageResponse(pkg));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const storePackage = async (req: Request, res: Response) => {
  try {
    const { items, ...data } = req.body;
    const pkg = await createPackage(data, items);
    return sendResponse(res, "Package Created Successfully", PackageResponse(pkg), 201);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to create package", {}, 500);
  }
};

export const editPackage = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await findPackage(id);
    if (!existing) return sendResponse(res, "Package Not Found", [], 404);

    const { items, ...data } = req.body;
    const pkg = await updatePackage(id, data, items);
    return sendResponse(res, "Package Updated Successfully", PackageResponse(pkg));
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to update package", {}, 500);
  }
};

export const removePackage = async (req: Request, res: Response) => {
  try {
    await deletePackage(Number(req.params.id));
    return sendResponse(res, "Package Deleted Successfully", []);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Failed to delete package", {}, 500);
  }
};
