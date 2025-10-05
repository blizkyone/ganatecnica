// Simple script to check diary entries in the database
const { MongoClient } = require("mongodb");

async function checkDiaryEntries() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("ganatecnica");

    // Check diary entries
    const diaryEntries = await db
      .collection("diaryentries")
      .find({})
      .limit(10)
      .toArray();
    console.log("Diary entries found:", diaryEntries.length);

    if (diaryEntries.length > 0) {
      console.log("Sample diary entries:");
      diaryEntries.forEach((entry, idx) => {
        console.log(`Entry ${idx + 1}:`, {
          _id: entry._id,
          project: entry.project,
          worker: entry.worker,
          date: entry.date,
          startTime: entry.startTime,
          endTime: entry.endTime,
          status: entry.status,
        });
      });
    } else {
      console.log("No diary entries found in database");
    }

    // Check projects
    const projects = await db
      .collection("proyectos")
      .find({})
      .limit(5)
      .toArray();
    console.log("\nProjects found:", projects.length);

    if (projects.length > 0) {
      console.log("Sample projects:");
      projects.forEach((project, idx) => {
        console.log(`Project ${idx + 1}:`, {
          _id: project._id,
          name: project.name,
          personal: project.personal?.length || 0,
          encargado: project.encargado,
        });
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkDiaryEntries();
