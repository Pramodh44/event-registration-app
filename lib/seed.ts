// lib/seed.ts

import dbConnect from "./mongodb";
import Event from "../models/event";
import Registration from "../models/registration";
import Analytics from "../models/analytics";

const seedData = async () => {
  try {
    console.log("Connecting to database...");
    await dbConnect();

    console.log("Clearing existing collections...");
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Analytics.deleteMany({});

    console.log("Inserting events...");
    const eventsToCreate = [
      {
        name: "React 19 & Next.js 16 Masterclass",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
        category: "Workshop",
        mode: "Online",
        description: "Dive deep into the new React 19 features (Server Components, Actions, useOptimistic) and Next.js 16 App Router architecture. Perfect for experienced developers.",
        totalSeats: 50,
        registeredCount: 0,
      },
      {
        name: "Building Resilient REST APIs with Node.js",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12), // 12 days from now
        category: "Seminar",
        mode: "Noida",
        description: "Learn best practices for designing scalable RESTful services, error handling, security, and using Mongoose with MongoDB.",
        totalSeats: 35,
        registeredCount: 0,
      },
      {
        name: "Global Hackathon: AI for Good",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25), // 25 days from now
        category: "Hackathon",
        mode: "Hybrid",
        description: "A 48-hour challenge to build innovative applications using generative AI to solve real-world sustainability and accessibility issues.",
        totalSeats: 100,
        registeredCount: 0,
      },
      {
        name: "Tailwind CSS v4 & Modern Web UI Design",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        category: "Webinar",
        mode: "Online",
        description: "Explore the new features of Tailwind CSS v4, including CSS-first configuration, improved performance, and custom dynamic styling variables.",
        totalSeats: 200,
        registeredCount: 0,
      },
      {
        name: "Advanced MongoDB Aggregations seminar",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18), // 18 days from now
        category: "Seminar",
        mode: "Noida",
        description: "Unlock the power of MongoDB Aggregation framework. Learn about pipeline optimization, grouping, mapping, and analytics aggregation.",
        totalSeats: 25,
        registeredCount: 0,
      },
      {
        name: "Full-Stack Security Essentials",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        category: "Workshop",
        mode: "Online",
        description: "A hands-on workshop covering OWASP Top 10 vulnerabilities, secure coding, JWT authorization, and MongoDB injection prevention.",
        totalSeats: 60,
        registeredCount: 0,
      },
      {
        name: "Noida Developers Meetup Summer 2026",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
        category: "Seminar",
        mode: "Noida",
        description: "Network with local Noida developers, discuss hot tech trends, and share engineering challenges over snacks and drinks.",
        totalSeats: 80,
        registeredCount: 0,
      },
      {
        name: "Startup Pitch & Build Hackathon",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40), // 40 days from now
        category: "Hackathon",
        mode: "Hybrid",
        description: "Pitch your startup idea and spend the weekend building a functional MVP with mentoring from industry experts.",
        totalSeats: 40,
        registeredCount: 0,
      },
    ];

    const insertedEvents = await Event.insertMany(eventsToCreate);
    console.log(`Inserted ${insertedEvents.length} events.`);

    console.log("Inserting sample registrations...");
    const sampleRegistrations = [
      {
        name: "Alice Smith",
        email: "alice@gmail.com",
        phone: "+15551234567",
        company: "Google",
        source: "LinkedIn",
        eventId: insertedEvents[0]._id, // NextJS Masterclass
      },
      {
        name: "Bob Jones",
        email: "bob@yahoo.com",
        phone: "9876543210",
        company: "Microsoft",
        source: "WhatsApp",
        eventId: insertedEvents[0]._id, // NextJS Masterclass
      },
      {
        name: "Charlie Brown",
        email: "charlie@gmail.com",
        phone: "+919999988888",
        company: "IIT Delhi",
        source: "Instagram",
        eventId: insertedEvents[0]._id, // NextJS Masterclass
      },
      {
        name: "Diana Prince",
        email: "diana@wayne.com",
        phone: "5551112222",
        company: "Justice Corp",
        source: "Email",
        eventId: insertedEvents[1]._id, // REST APIs
      },
      {
        name: "Evan Wright",
        email: "evan@gmail.com",
        phone: "9812345678",
        company: "TCS",
        source: "Direct",
        eventId: insertedEvents[1]._id, // REST APIs
      },
      {
        name: "Fiona Gallagher",
        email: "fiona@gallagher.com",
        phone: "3125556666",
        company: "South Side High",
        source: "WhatsApp",
        eventId: insertedEvents[2]._id, // AI Hackathon
      },
      {
        name: "George Costanza",
        email: "george@seinfeld.com",
        phone: "2125559999",
        company: "Vandelay Industries",
        source: "Direct",
        eventId: insertedEvents[2]._id, // AI Hackathon
      },
      {
        name: "Hannah Abbott",
        email: "hannah@hogwarts.edu",
        phone: "7778889999",
        company: "Hufflepuff Ltd",
        source: "Instagram",
        eventId: insertedEvents[3]._id, // Tailwind CSS
      },
      {
        name: "Ian Malcolm",
        email: "ian@jurassic.org",
        phone: "8885551212",
        company: "InGen",
        source: "LinkedIn",
        eventId: insertedEvents[3]._id, // Tailwind CSS
      },
      {
        name: "Julia Roberts",
        email: "julia@pretty.com",
        phone: "1112223333",
        company: "Columbia Pictures",
        source: "Email",
        eventId: insertedEvents[4]._id, // MongoDB Aggregations
      },
    ];

    await Registration.insertMany(sampleRegistrations);
    console.log(`Inserted ${sampleRegistrations.length} registrations.`);

    // Update registeredCount values on events to match
    console.log("Updating event registered counts...");
    for (const event of insertedEvents) {
      const count = sampleRegistrations.filter(
        (r) => r.eventId.toString() === event._id.toString()
      ).length;
      if (count > 0) {
        await Event.findByIdAndUpdate(event._id, { registeredCount: count });
      }
    }

    console.log("Seeding analytics activity records...");
    const sampleAnalytics = [
      { action: "event_list_viewed", payload: { count: 8 }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { action: "event_search_performed", payload: { query: "React" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 25) },
      { action: "event_card_clicked", payload: { eventId: insertedEvents[0]._id, name: insertedEvents[0].name }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 20) },
      { action: "registration_submitted", payload: { name: "Alice Smith", email: "alice@gmail.com" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 18) },
      { action: "registration_success", payload: { eventId: insertedEvents[0]._id, email: "alice@gmail.com" }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 18) },
      { action: "event_list_viewed", payload: { count: 8 }, userAgent: "Mozilla/5.0", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    ];
    await Analytics.insertMany(sampleAnalytics);
    console.log("Inserted analytics entries.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
