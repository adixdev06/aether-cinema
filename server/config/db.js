import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '.storage');

let isMongoConnected = false;

// Fallback JSON-backed in-memory store
class MemoryStore {
  constructor() {
    this.data = {
      users: [],
      watched: [],
      watchlist: [],
      ratings: [],
      preferences: []
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const filePath = path.join(DATA_DIR, 'db_fallback.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.log('Using in-memory ephemeral store');
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const filePath = path.join(DATA_DIR, 'db_fallback.json');
      fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      // ignore
    }
  }

  find(collection, filter = {}) {
    let items = this.data[collection] || [];
    return items.filter(item => {
      return Object.keys(filter).every(key => item[key] === filter[key]);
    });
  }

  findOne(collection, filter = {}) {
    const res = this.find(collection, filter);
    return res.length > 0 ? res[0] : null;
  }

  insert(collection, doc) {
    if (!this.data[collection]) this.data[collection] = [];
    const newDoc = {
      _id: doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    this.data[collection].push(newDoc);
    this.save();
    return newDoc;
  }

  updateOne(collection, filter, update) {
    const item = this.findOne(collection, filter);
    if (!item) return null;
    Object.assign(item, update, { updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  deleteOne(collection, filter) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => {
      return !Object.keys(filter).every(key => item[key] === filter[key]);
    });
    this.save();
    return this.data[collection].length < initialLen;
  }
}

export const memoryDb = new MemoryStore();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aether_cinema';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[AETHER Database] Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[AETHER Database] MongoDB not running locally (${error.message}). Resilient JSON Memory Engine activated!`);
  }
};

export const getDbStatus = () => ({
  isMongoConnected,
  engine: isMongoConnected ? 'MongoDB' : 'Resilient In-Memory & File Storage'
});
