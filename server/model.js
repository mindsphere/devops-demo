/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

const mongoose = require('mongoose');

const TodoSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Todo', TodoSchema);
