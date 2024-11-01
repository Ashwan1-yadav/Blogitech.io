const mongoose = require("mongoose");

async function databaseConnect(url) {
  mongoose
    .connect(url)
}

module.exports = {
  databaseConnect,
};
