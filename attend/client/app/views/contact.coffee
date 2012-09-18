View = require "./view"
template = require "./templates/contact"

module.exports = class ContactView extends View
  template: template
  getRenderData: ->
    contact:@model.toJSON()
    events: (model.toJSON() for model in @collection.getEvents())
    title: "Attendence Record"