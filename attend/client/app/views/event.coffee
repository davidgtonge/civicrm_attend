View = require "./view"
template = require "./templates/event"


module.exports = class Event extends View
  template:template
  getRenderData: ->
    title:"Event Attendence Records"
    event:@model.toJSON()
    dates:@collection.getDates()
    contacts:@collection.getContacts()
