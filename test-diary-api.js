const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testDiaryAPI() {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log("Testing diary API for date:", today);

    // Replace 'YOUR_PROJECT_ID' with an actual project ID
    const projectId = "6703a74c35e8c24b7d7e2fcb"; // Use a real project ID here
    const url = `http://localhost:3002/api/diary/project/${projectId}?date=${today}`;

    console.log("Fetching from:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("API Response Status:", response.status);
    console.log("API Response Data:", JSON.stringify(data, null, 2));

    if (data.entries) {
      console.log("\nEntries by date:");
      Object.keys(data.entries).forEach((date) => {
        console.log(`  ${date}:`, data.entries[date].length, "entries");
        data.entries[date].forEach((entry, idx) => {
          console.log(`    Entry ${idx + 1}:`, {
            worker: entry.worker?.name || entry.worker,
            startTime: entry.startTime,
            endTime: entry.endTime,
            notes: entry.notes,
          });
        });
      });
    }
  } catch (error) {
    console.error("Error testing diary API:", error);
  }
}

testDiaryAPI();
