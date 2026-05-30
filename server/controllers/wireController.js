import { getWireClient } from "../services/wireService.js";

export async function listCatalogs(req, res, next) {
  try {
    const client = getWireClient();
    const { data } = await client.get("/holocron/catalog", {
      params: req.query,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getCatalog(req, res, next) {
  try {
    const client = getWireClient();
    const { data } = await client.get(`/holocron/catalog/${req.params.slug}`);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function searchActions(req, res, next) {
  try {
    const client = getWireClient();
    const { data } = await client.get("/holocron/search", {
      params: req.query,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function executeTask(req, res, next) {
  try {
    const client = getWireClient();
    const { data } = await client.post("/holocron/task", req.body);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function getJob(req, res, next) {
  try {
    const client = getWireClient();
    const { data } = await client.get(`/holocron/jobs/${req.params.id}`);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}
