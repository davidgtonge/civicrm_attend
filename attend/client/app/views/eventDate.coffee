View = require "./view"
template = require "./templates/eventDate"


module.exports = class EventDate extends View
  template: template
  getRenderData: ->
    event:@model.toJSON()
    contacts: (model.toJSON() for model in @collection.getContacts())
    date:@options.date