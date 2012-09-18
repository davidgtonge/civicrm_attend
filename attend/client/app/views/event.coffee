View = require "./view"

module.exports = class Event extends View
  getRenderData: ->
    event:@model.toJSON()
