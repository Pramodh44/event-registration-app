import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Declare global to prevent multiple declarations during HMR
const globalWithMongoose = global as typeof global & {
  mongoose: { conn: any; promise: any };
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = globalWithMongoose.mongoose || { conn: null, promise: null };

// Global mock state
if ((global as any).useMockDB === undefined) {
  (global as any).useMockDB = false;
}

const MOCK_DB_PATH = path.join(process.cwd(), "lib", "mock-db.json");

// Helper to initialize mock DB with default seed data if it doesn't exist
function initMockDB() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const defaultEvents = [
      {
        _id: "evt_1",
        name: "React 19 & Next.js 16 Masterclass",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
        category: "Workshop",
        mode: "Online",
        description: "Dive deep into the new React 19 features (Server Components, Actions, useOptimistic) and Next.js 16 App Router architecture. Perfect for experienced developers.",
        totalSeats: 50,
        registeredCount: 3,
      },
      {
        _id: "evt_2",
        name: "Building Resilient REST APIs with Node.js",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
        category: "Seminar",
        mode: "Noida",
        description: "Learn best practices for designing scalable RESTful services, error handling, security, and using Mongoose with MongoDB.",
        totalSeats: 35,
        registeredCount: 2,
      },
      {
        _id: "evt_3",
        name: "Global Hackathon: AI for Good",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
        category: "Hackathon",
        mode: "Hybrid",
        description: "A 48-hour challenge to build innovative applications using generative AI to solve real-world sustainability and accessibility issues.",
        totalSeats: 100,
        registeredCount: 2,
      },
      {
        _id: "evt_4",
        name: "Tailwind CSS v4 & Modern Web UI Design",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        category: "Webinar",
        mode: "Online",
        description: "Explore the new features of Tailwind CSS v4, including CSS-first configuration, improved performance, and custom dynamic styling variables.",
        totalSeats: 200,
        registeredCount: 2,
      },
      {
        _id: "evt_5",
        name: "Advanced MongoDB Aggregations seminar",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
        category: "Seminar",
        mode: "Noida",
        description: "Unlock the power of MongoDB Aggregation framework. Learn about pipeline optimization, grouping, mapping, and analytics aggregation.",
        totalSeats: 25,
        registeredCount: 1,
      },
      {
        _id: "evt_6",
        name: "Full-Stack Security Essentials",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        category: "Workshop",
        mode: "Online",
        description: "A hands-on workshop covering OWASP Top 10 vulnerabilities, secure coding, JWT authorization, and MongoDB injection prevention.",
        totalSeats: 60,
        registeredCount: 0,
      },
      {
        _id: "evt_7",
        name: "Noida Developers Meetup Summer 2026",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        category: "Seminar",
        mode: "Noida",
        description: "Network with local Noida developers, discuss hot tech trends, and share engineering challenges over snacks and drinks.",
        totalSeats: 80,
        registeredCount: 0,
      },
      {
        _id: "evt_8",
        name: "Startup Pitch & Build Hackathon",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40).toISOString(),
        category: "Hackathon",
        mode: "Hybrid",
        description: "Pitch your startup idea and spend the weekend building a functional MVP with mentoring from industry experts.",
        totalSeats: 40,
        registeredCount: 0,
      },
    ];

    const defaultRegistrations = [
      {
        _id: "reg_1",
        name: "Alice Smith",
        email: "alice@gmail.com",
        phone: "+15551234567",
        company: "Google",
        source: "LinkedIn",
        eventId: "evt_1",
      },
      {
        _id: "reg_2",
        name: "Bob Jones",
        email: "bob@yahoo.com",
        phone: "9876543210",
        company: "Microsoft",
        source: "WhatsApp",
        eventId: "evt_1",
      },
      {
        _id: "reg_3",
        name: "Charlie Brown",
        email: "charlie@gmail.com",
        phone: "+919999988888",
        company: "IIT Delhi",
        source: "Instagram",
        eventId: "evt_1",
      },
      {
        _id: "reg_4",
        name: "Diana Prince",
        email: "diana@wayne.com",
        phone: "5551112222",
        company: "Justice Corp",
        source: "Email",
        eventId: "evt_2",
      },
      {
        _id: "reg_5",
        name: "Evan Wright",
        email: "evan@gmail.com",
        phone: "9812345678",
        company: "TCS",
        source: "Direct",
        eventId: "evt_2",
      },
      {
        _id: "reg_6",
        name: "Fiona Gallagher",
        email: "fiona@gallagher.com",
        phone: "3125556666",
        company: "South Side High",
        source: "WhatsApp",
        eventId: "evt_3",
      },
      {
        _id: "reg_7",
        name: "George Costanza",
        email: "george@seinfeld.com",
        phone: "2125559999",
        company: "Vandelay Industries",
        source: "Direct",
        eventId: "evt_3",
      },
      {
        _id: "reg_8",
        name: "Hannah Abbott",
        email: "hannah@hogwarts.edu",
        phone: "7778889999",
        company: "Hufflepuff Ltd",
        source: "Instagram",
        eventId: "evt_4",
      },
      {
        _id: "reg_9",
        name: "Ian Malcolm",
        email: "ian@jurassic.org",
        phone: "8885551212",
        company: "InGen",
        source: "LinkedIn",
        eventId: "evt_4",
      },
      {
        _id: "reg_10",
        name: "Julia Roberts",
        email: "julia@pretty.com",
        phone: "1112223333",
        company: "Columbia Pictures",
        source: "Email",
        eventId: "evt_5",
      },
    ];

    const defaultAnalytics = [
      { _id: "an_1", action: "event_list_viewed", payload: { count: 8 }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { _id: "an_2", action: "event_search_performed", payload: { query: "React" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { _id: "an_3", action: "event_card_clicked", payload: { eventId: "evt_1", name: "React 19 & Next.js 16 Masterclass" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { _id: "an_4", action: "registration_submitted", payload: { name: "Alice Smith", email: "alice@gmail.com" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
      { _id: "an_5", action: "registration_success", payload: { eventId: "evt_1", email: "alice@gmail.com" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
      { _id: "an_6", action: "event_list_viewed", payload: { count: 8 }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    ];

    const initialData = {
      Event: defaultEvents,
      Registration: defaultRegistrations,
      Analytics: defaultAnalytics,
    };

    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    console.log("Mock database initialized at:", MOCK_DB_PATH);
  }
}

function readMockData(collectionName: string) {
  initMockDB();
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
    return data[collectionName] || [];
  } catch (err) {
    console.error("Error reading mock database:", err);
    return [];
  }
}

function writeMockData(collectionName: string, collectionData: any[]) {
  initMockDB();
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf8"));
    data[collectionName] = collectionData;
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing mock database:", err);
  }
}

// Check-match helper for query filter properties
const matchQuery = (item: any, key: string, val: any): boolean => {
  if (val === undefined) return true;
  if (val === null) return item[key] === null;

  if (typeof val === "object" && val !== null) {
    if ("$regex" in val) {
      const pattern = val.$regex;
      const options = val.$options || "";
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, options);
      return regex.test(item[key] || "");
    }
  }

  if (val instanceof RegExp) {
    return val.test(item[key] || "");
  }

  return String(item[key]) === String(val);
};

// Chained Mongoose-like Query execution simulation class
class QueryChain {
  results: any[];
  modelName: string;

  constructor(results: any[], modelName: string) {
    this.results = results;
    this.modelName = modelName;
  }

  sort(sortObj: any) {
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key];
    this.results.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (valA < valB) return order === 1 ? -1 : 1;
      if (valA > valB) return order === 1 ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(num: number) {
    this.results = this.results.slice(0, num);
    return this;
  }

  populate(path: string, selectFields?: string) {
    if (this.modelName === "Registration" && path === "eventId") {
      const events = readMockData("Event");
      this.results.forEach((reg: any) => {
        const event = events.find((e: any) => String(e._id) === String(reg.eventId));
        if (event) {
          if (selectFields === "name") {
            reg.eventId = { _id: event._id, name: event.name };
          } else {
            reg.eventId = { ...event };
          }
        }
      });
    }
    return this;
  }

  // Thenable structure to support direct await calls on find/query results
  then(resolve: any, reject: any) {
    resolve(this.results);
  }
}

// Mock Model CRUD operations simulator
class MockModel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  getData() {
    return readMockData(this.name);
  }

  saveData(data: any[]) {
    writeMockData(this.name, data);
  }

  find(query: any = {}) {
    let data = this.getData();
    if (query && Object.keys(query).length > 0) {
      data = data.filter((item: any) => {
        for (const key in query) {
          if (!matchQuery(item, key, query[key])) return false;
        }
        return true;
      });
    }
    return new QueryChain(data, this.name);
  }

  async findById(id: any) {
    const data = this.getData();
    const found = data.find((item: any) => String(item._id) === String(id));
    return found ? { ...found } : null;
  }

  async findOne(query: any) {
    const chain = this.find(query);
    return chain.results[0] ? { ...chain.results[0] } : null;
  }

  async countDocuments(query: any = {}) {
    const chain = this.find(query);
    return chain.results.length;
  }

  async create(doc: any) {
    const data = this.getData();
    const newDoc = {
      _id: "mock_" + Math.random().toString(36).substring(2, 11),
      ...doc,
    };
    data.push(newDoc);
    this.saveData(data);
    return newDoc;
  }

  async findByIdAndUpdate(id: any, update: any) {
    const data = this.getData();
    const index = data.findIndex((item: any) => String(item._id) === String(id));
    if (index === -1) return null;

    const item = { ...data[index] };
    if (update.$inc) {
      for (const key in update.$inc) {
        item[key] = (item[key] || 0) + update.$inc[key];
      }
    }
    if (update.$set) {
      Object.assign(item, update.$set);
    }
    data[index] = item;
    this.saveData(data);
    return item;
  }

  async insertMany(docs: any[]) {
    const data = this.getData();
    const newDocs = docs.map((d) => ({
      _id: d._id || "mock_" + Math.random().toString(36).substring(2, 11),
      ...d,
    }));
    data.push(...newDocs);
    this.saveData(data);
    return newDocs;
  }

  async deleteMany(query: any = {}) {
    if (Object.keys(query).length === 0) {
      this.saveData([]);
    } else {
      let data = this.getData();
      data = data.filter((item: any) => {
        for (const key in query) {
          if (matchQuery(item, key, query[key])) return false;
        }
        return true;
      });
      this.saveData(data);
    }
    return { deletedCount: 0 };
  }

  async aggregate(pipeline: any[]) {
    const data = this.getData();
    if (this.name === "Registration") {
      const counts: Record<string, number> = {};
      data.forEach((r: any) => {
        const src = r.source || "Direct";
        counts[src] = (counts[src] || 0) + 1;
      });
      return Object.keys(counts).map((src) => ({
        _id: src,
        count: counts[src],
      }));
    } else if (this.name === "Event") {
      const categories: Record<string, { eventCount: number; registrationCount: number }> = {};
      data.forEach((e: any) => {
        const cat = e.category || "Workshop";
        if (!categories[cat]) {
          categories[cat] = { eventCount: 0, registrationCount: 0 };
        }
        categories[cat].eventCount += 1;
        categories[cat].registrationCount += e.registeredCount || 0;
      });
      return Object.keys(categories).map((cat) => ({
        _id: cat,
        eventCount: categories[cat].eventCount,
        registrationCount: categories[cat].registrationCount,
      }));
    }
    return [];
  }
}

async function dbConnect() {
  if ((global as any).useMockDB) {
    return null;
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        family: 4,
      } as any)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB Atlas successfully!");
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn("MongoDB Atlas connection failed. Switching to local JSON fallback database:", err.message);
        (global as any).useMockDB = true;
        initMockDB();
        return null;
      });
  }
  cached.conn = await cached.promise;
  if (!cached.conn) {
    (global as any).useMockDB = true;
  }
  return cached.conn;
}

// Proxied model getter to transparently switch query targets at runtime
export function getModel(modelName: string, schema: any) {
  const mockModelInstance = new MockModel(modelName);

  return new Proxy(function () {} as any, {
    get(target, prop) {
      if ((global as any).useMockDB) {
        return (mockModelInstance as any)[prop];
      } else {
        const realModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
        return (realModel as any)[prop];
      }
    },
    construct(target, args) {
      if ((global as any).useMockDB) {
        return args[0]; // return mock object directly
      } else {
        const realModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
        return Reflect.construct(realModel, args);
      }
    },
  });
}

export default dbConnect;
