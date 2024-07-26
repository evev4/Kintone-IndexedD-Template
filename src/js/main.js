import { Button } from "kintone-ui-component/lib/Button";
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { addData, fetchData, deleteData } from "./indexedDB.js";

(() => {
  "use strict";
  // Define database info
  const database = { name: "kintoneDB", version: 1 };
  const DATA_ID = 1;

  // Define kintone app field code
  const productNameFieldCode = "Product_Name";
  const partsTableFieldCode = "Parts";
  const partNumberFieldCode = "Part_Number";
  const partNameFieldCode = "Part_Name";

  // Function to update the parts list table based on the selected product name
  async function updatePartsListTable(ev) {
    const record = ev.record;
    const productName = record[productNameFieldCode].value;

    try {
      const parts = await fetchData(database, DATA_ID, productName);

      if (!parts || parts.length === 0) {
        console.log("No parts found.");
        return;
      }

      // Get the template row from the table and map the data
      const tempRow = record[partsTableFieldCode].value[0];
      const newRows = parts.map((part) => {
        const row = structuredClone(tempRow);
        row.value[partNumberFieldCode].value = part.Part_Number;
        row.value[partNameFieldCode].value = part.Part_Name;
        return row;
      });

      record[partsTableFieldCode].value = newRows;
      kintone.app.record.set({ record });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Function to add part list data to the IndexedDB
  async function addPartListData() {
    const partListAppId = kintone.app.getLookupTargetAppId("Part_Number");
    const client = new KintoneRestAPIClient({});

    try {
      const records = await client.record.getAllRecords({ app: partListAppId });
      const data = { id: DATA_ID, appId: partListAppId, records };

      const message = await addData(data, database);
      console.log(message);
    } catch (error) {
      console.error("Failed to add part list data:", error);
    }
  }

  // Function to delete part list data from the IndexedDB
  async function deletePartListData() {
    try {
      const message = await deleteData(database);
      console.log(message);
    } catch (error) {
      console.error("Failed to delete part list data:", error);
    }
  }

  // Helper function to create a button if it doesn't exist and add an event listener to it
  function createButton(buttonId, buttonName, onClick) {
    let button = document.getElementById(buttonId);
    if (!button) {
      button = new Button({
        text: buttonName,
        type: "submit",
        className: "options-class",
        id: buttonId,
        visible: true,
        disabled: false
      });
      kintone.app.getHeaderMenuSpaceElement().appendChild(button);
      button.addEventListener("click", onClick);
    }
  }

  // Event listener for the index show event to add the Add and Delete buttons
  kintone.events.on("app.record.index.show", () => {
    createButton("add-button", "Add Parts DB", addPartListData);
    createButton("delete-button", "Delete Parts DB", deletePartListData);
  });

  // Event listener for changes to the Product_Name field to update the parts list table
  kintone.events.on(
    [
      "app.record.edit.change.Product_Name",
      "app.record.create.change.Product_Name"
    ],
    (event) => {
      updatePartsListTable(event);
      return event;
    }
  );
})();
