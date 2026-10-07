import { Resource } from "../models/catalogModels.js";
import User from "../models/User.js";

// POST /api/resources  (student softcopy notes / e-resource upload)
export async function createUserResource(req, res) {
  const { examSlug, subjectName, title, description, url, type = "notes", fileName } = req.body || {};
  if (!title || !url) return res.status(400).json({ message: "Title and a softcopy file or document URL are required." });

  const resource = await Resource.create({
    examSlug: examSlug || "",
    subjectName: subjectName || "",
    type: ["pdf", "notes", "ebook", "practice", "video"].includes(type) ? type : "notes",
    title,
    description: description || (fileName ? `Softcopy notes uploaded: ${fileName}` : ""),
    url,
    source: "user",
    sharedBy: req.user.name,
  });
  res.status(201).json({ resource });
}

// GET /api/resources?examSlug=&subjectName=&type=&search=
export async function listResources(req, res) {
  const { examSlug, subjectName, type, search = "" } = req.query;
  const conditions = [];

  if (examSlug) conditions.push({ examSlug });
  if (subjectName) conditions.push({ subjectName });

  if (type && type !== "all") {
    if (type === "shared-pdfs" || type === "shared") {
      conditions.push({ $or: [{ source: "user" }, { type: "pdf" }, { type: "notes" }] });
    } else {
      conditions.push({ type });
    }
  }

  if (search && search.trim()) {
    const s = search.trim();
    conditions.push({
      $or: [
        { title: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
        { subjectName: { $regex: s, $options: "i" } },
        { sharedBy: { $regex: s, $options: "i" } },
      ],
    });
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};
  const resources = await Resource.find(filter).limit(300).sort({ createdAt: -1 });
  const bookmarked = req.user?.bookmarkedResources || [];

  res.json({
    resources: resources.map((r) => ({ ...r.toObject(), bookmarked: bookmarked.some((id) => id.equals(r._id)) })),
  });
}

// POST /api/resources/:id/bookmark  - toggles bookmark for the current user
export async function toggleBookmark(req, res) {
  const user = req.user;
  user.bookmarkedResources = user.bookmarkedResources || [];
  const idx = user.bookmarkedResources.findIndex((id) => id.equals(req.params.id));
  let bookmarked;
  if (idx >= 0) {
    user.bookmarkedResources.splice(idx, 1);
    bookmarked = false;
  } else {
    user.bookmarkedResources.push(req.params.id);
    bookmarked = true;
  }
  await user.save();
  res.json({ bookmarked });
}
