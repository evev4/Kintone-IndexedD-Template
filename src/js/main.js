import { addData, fetchData, deleteData } from "./indexedDB.js";
import { Button } from "kintone-ui-component/lib/Button";
import { KintoneRestAPIClient } from "@kintone/rest-api-client";

(() => {
  "use strict";
  const database = { name: "kintoneDB", version: 1 };
  const DATA_ID = 1;

  const productNameFieldCode = "Product_Name";
  const partsTableFieldCode = "Parts";
  const partNumberFieldCode = "Part_Number";
  const partNameFieldCode = "Part_Name";

  function updatePartsListTable(record) {
    const productName = record[productNameFieldCode].value;

    return fetchData(database, DATA_ID, productName)
      .then((parts) => {
        if (!parts) {
          // Return an empty array if no parts are found
          console.log("No parts found.");
          return;
        }
        console.log(parts);

        // Get the template row from the table and map the data
        const tempRow = record[partsTableFieldCode].value[0];
        const newRows = parts.map((part) => {
          const row = structuredClone(tempRow);
          row.value[partNumberFieldCode].value = part.Part_Number;
          row.value[partNameFieldCode].value = part.Part_Name;
          return row;
        });

        record[partsTableFieldCode].value = newRows;
        kintone.app.record.set({ record: record });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  function addPartListData() {
    const partListAppId = kintone.app.getLookupTargetAppId("Part_Number");
    const client = new KintoneRestAPIClient({});
    client.record
      .getAllRecords({ app: partListAppId })
      .then((records) => {
        const data = {
          id: DATA_ID,
          appId: partListAppId,
          records: records
        };
        // Add data to the database
        addData(data, database)
          .then((message) => {
            console.log(message);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function deletePartListData() {
    deleteData(database)
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function getButton(buttonId, buttonName) {
    let button = document.getElementById(buttonId);
    if (button != null) {
      return button;
    }

    const header = kintone.app.getHeaderMenuSpaceElement();

    button = new Button({
      text: buttonName,
      type: "submit",
      className: "options-class",
      id: buttonId,
      visible: true,
      disabled: false
    });
    header.appendChild(button);
    return button;
  }

  kintone.events.on("app.record.index.show", (event) => {
    const addButton = getButton("add-button", "Add Parts DB");
    if (addButton != null) {
      addButton.addEventListener("click", () => {
        addPartListData();
      });
    }
    const delButton = getButton("delete-button", "Delete Parts DB");
    if (delButton != null) {
      delButton.addEventListener("click", () => {
        deletePartListData();
      });
    }
    return event;
  });

  kintone.events.on(
    [
      "app.record.edit.change.Product_Name",
      "app.record.create.change.Product_Name"
    ],
    (event) => {
      updatePartsListTable(event.record);
    }
  );
})();
