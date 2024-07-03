const importData = async (model, data) => {
  await model.create(data, { validateBeforeSave: false });
  console.log("data has been imported successfuly");
};

module.exports = importData;
