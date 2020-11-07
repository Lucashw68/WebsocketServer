const mongoose = require('mongoose')

const ModelSchema = mongoose.Schema({
  property: String
})

module.exports = mongoose.model('Model', ModelSchema)
