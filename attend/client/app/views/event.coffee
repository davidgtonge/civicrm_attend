View = require "./view"
template = require "./templates/event"


module.exports = class Event extends View
  template:template

  init: ->
    @contactsOn "add remove", @render

  getRenderData: ->
    title:"Event Attendence Records"
    event:@model.toJSON()
    dates:@collection.getDates()
    contacts:@options.contacts.toJSON()
