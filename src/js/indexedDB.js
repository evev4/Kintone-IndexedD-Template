// Open (or create) the database
async function openDatabase(database) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database.name, database.version);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("partList")) {
        db.createObjectStore("partList", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) =>
      reject(`Database error: ${event.target.errorCode}`);
  });
}

// Add data to the database
export async function addData(data, database) {
  try {
    const db = await openDatabase(database);
    const transaction = db.transaction(["partList"], "readwrite");
    const objectStore = transaction.objectStore("partList");
    const request = objectStore.add(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve("Record added to the database");
      request.onerror = (event) =>
        reject(`Transaction error: ${event.target.errorCode}`);
    });
  } catch (error) {
    throw new Error(`Failed to add data: ${error.message}`);
  }
}

// Fetch data from the database
export async function fetchData(database, dataId, productName) {
  try {
    const db = await openDatabase(database);
    const transaction = db.transaction(["partList"], "readonly");
    const objectStore = transaction.objectStore("partList");
    const request = objectStore.get(dataId);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const data = event.target.result;
        if (!data) {
          resolve([]);
        }

        const relatedParts = data.records
          .filter((record) => record.Related_Product_Name.value === productName)
          .map((record) => ({
            Part_Number: record.Part_Number.value,
            Part_Name: record.Part_Name.value
          }));
        resolve(relatedParts);
      };
      request.onerror = (event) =>
        reject(`Error retrieving record: ${event.target.errorCode}`);
    });
  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
}

// Delete the database
export async function deleteData(database) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(database.name);

    request.onsuccess = () => resolve("Database deleted successfully");
    request.onerror = (event) =>
      reject(`Error deleting database: ${event.target.errorCode}`);
    request.onblocked = () => reject("Database deletion blocked");
  });
}
