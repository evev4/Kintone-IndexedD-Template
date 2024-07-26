// Open (or create) the database
function openDatabase(database) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database.name, database.version);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("partListData")) {
        db.createObjectStore("partListData", {
          keyPath: "id"
        });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };
  });
}

// Add data to the database
export function addData(data, database) {
  return openDatabase(database).then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["partListData"], "readwrite");
      const objectStore = transaction.objectStore("partListData");
      const request = objectStore.add(data);

      request.onsuccess = function () {
        resolve("Record added to the database");
      };

      request.onerror = function (event) {
        reject("Transaction error: " + event.target.errorCode);
      };
    });
  });
}

// Fetch data from the database
export function fetchData(database, dataId, productName) {
  return openDatabase(database).then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["partListData"], "readonly");
      const objectStore = transaction.objectStore("partListData");
      const request = objectStore.get(dataId);

      request.onsuccess = function (event) {
        const data = event.target.result;
        if (data && data.records) {
          const relatedParts = data.records
            .filter(
              (record) => record.Related_Product_Name.value === productName
            )
            .map((record) => ({
              Part_Number: record.Part_Number.value,
              Part_Name: record.Part_Name.value
            }));
          resolve(relatedParts);
        } else {
          resolve([]);
        }
      };

      request.onerror = function (event) {
        reject("Error retrieving record: " + event.target.errorCode);
      };
    });
  });
}

// Delete the database
export function deleteData(database) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(database.name);

    request.onsuccess = function () {
      resolve("Database deleted successfully");
    };

    request.onerror = function (event) {
      reject("Error deleting database: " + event.target.errorCode);
    };

    request.onblocked = function () {
      reject("Database deletion blocked");
    };
  });
}
