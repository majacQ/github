aha.on(
  { event: "aha-develop.github.pr.labeled" },
  async ({ record, label, payload }) => {
    console.log(record);
    console.log(label);

    if (label.name === "documentation") {
      record.workflowStatus = { name: "Will not implement" };
      await record.save();
    }
  }
);
