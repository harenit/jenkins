import Exam from "../models/Exam.js";
import { Flashcard, Resource, Product } from "../models/catalogModels.js";
import { buildExamCatalog } from "./examCatalog.js";
import { generateResources, generateProducts, generateBuiltInFlashcards } from "./catalogGenerators.js";

/**
 * Idempotent: only seeds if the Exam collection is empty. Runs automatically
 * on server startup. This is what actually populates MongoDB with the
 * exam roadmaps, resources, marketplace products, built-in flashcards, and
 * seeded community discussions - everything the frontend reads is real
 * data sitting in Atlas, not hardcoded frontend arrays.
 */
export async function seedCatalog() {
  const exams = buildExamCatalog();

  // Keep the MongoDB catalog synchronized with the verified catalog definition.
  await Exam.bulkWrite(exams.map((exam) => ({
    updateOne: { filter: { slug: exam.slug }, update: { $set: exam }, upsert: true },
  })));

  // Refresh catalog-owned resources/products so stale generated listings are removed;
  // student-created listings remain untouched.
  await Resource.deleteMany({ source: "catalog" });
  await Product.deleteMany({ source: "catalog" });

  let resourceCount = 0;
  let productCount = 0;
  let flashcardCount = 0;

  for (const exam of exams) {
    const resources = generateResources(exam.slug, exam.name, exam.subjects, exam.officialUrl);
    const products = generateProducts(exam.slug, exam.name, exam.subjects);
    const flashcards = generateBuiltInFlashcards(exam.slug, exam.subjects);
    if (resources.length) await Resource.insertMany(resources);
    if (products.length) await Product.insertMany(products);
    const insertedProducts = products.length;
    const existingCards = await Flashcard.countDocuments({ examSlug: exam.slug, source: "built-in" });
    if (!existingCards && flashcards.length) await Flashcard.insertMany(flashcards);
    resourceCount += resources.length;
    productCount += insertedProducts;
    flashcardCount += existingCards ? 0 : flashcards.length;
  }


  console.log(`[seed] Catalog synchronized — ${exams.length} exams, ${resourceCount} catalog resources refreshed, ${productCount} new products, ${flashcardCount} new built-in flashcards.`);
}
