import React from "react";

/**
 * @param {Aha.RecordStub} record
 */
function createBranch(record) {
  aha.command("aha-develop.github.createBranch", {
    name: `${record.referenceNum}-branch`,
  });
}

async function sync(record) {
  await aha.command("aha-develop.github.sync", record);
}

async function addLink(record) {
  await aha.command("aha-develop.github.addLink", record);
}

async function removeLinks(record) {
  await aha.command("aha-develop.github.removeLinks", record);
}

function Menu({ record }) {
  return (
    <aha-action-menu buttonSize="medium" style={{ marginLeft: 5 }}>
      <aha-menu>
        <aha-menu-item onClick={() => createBranch(record)}>
          Create Branch
        </aha-menu-item>
        <aha-menu-item onClick={() => sync(record)}>Resync</aha-menu-item>
        <aha-menu-item onClick={() => addLink(record)}>
          Link pull request
        </aha-menu-item>
        <aha-menu-item onClick={() => removeLinks(record)}>
          Unlink pull requests
        </aha-menu-item>
      </aha-menu>
    </aha-action-menu>
  );
}

export default Menu;