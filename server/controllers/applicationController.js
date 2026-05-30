import Application from "../models/Application.js";

export async function listApplications(req, res, next) {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.json({ applications });
  } catch (err) {
    return next(err);
  }
}

export async function createApplication(req, res, next) {
  try {
    const { company, role, status, matchScore, applyUrl } = req.body;
    if (!company || !role) {
      return res.status(400).json({ message: "Company and role are required" });
    }

    const application = await Application.create({
      userId: req.userId,
      company,
      role,
      status: status || "Saved",
      matchScore,
      applyUrl,
    });

    return res.status(201).json({ application });
  } catch (err) {
    return next(err);
  }
}

export async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({ application });
  } catch (err) {
    return next(err);
  }
}

export async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const result = await Application.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });
    if (!result) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.json({ message: "Deleted" });
  } catch (err) {
    return next(err);
  }
}
