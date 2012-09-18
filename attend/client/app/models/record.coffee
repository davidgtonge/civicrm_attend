Model = require "./model"

module.exports = class RecordModel extends Model
  methodMap:
    create: "create_contact_record"
    update: "set_contact_record"
    read: "get_contact_record"
    delete: "delete_contact_record"

  entity:"attend"

  toJSON: ->
    data = super
    unless _.isString data.date
      data.date = data.date.toString("yyyy-MM-dd")
    data

  initialize: ->
    @relatedEvent = @collection.App.events.getOrFetch(@get "event_id")
    @relatedEvent.on "change", => @trigger "change"
    @relatedContact = @collection.App.contacts.getOrFetch(@get "contact_id")
    @relatedContact.on "change", => @trigger "change"





