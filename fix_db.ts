import mongoose from 'mongoose';
import { mockBooks } from './src/lib/data/mockBooks';

async function fixDb() {
  await mongoose.connect('mongodb+srv://kouassidouffan_db_user:xhVvAVcpiP5W6vn3@cluster0.jvvmgbf.mongodb.net/livreo?retryWrites=true&w=majority&appName=Cluster0');
  console.log("Connected to MongoDB");

  const BookModel = mongoose.connection.collection('books');

  for (const b of mockBooks) {
    const doc = { ...b };
    if (doc._id) {
      (doc as any)._id = new mongoose.Types.ObjectId(String(doc._id));
    }

    await BookModel.updateOne(
      { slug: doc.slug },
      { $set: doc },
      { upsert: true }
    );
  }

  console.log("DB sync complete!");
  process.exit(0);
}

fixDb().catch(console.error);
