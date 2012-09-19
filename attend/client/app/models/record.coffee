Model = require "./model"
noop = ->
stub =
  toJSON: noop
  get: noop
  on: noop

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

  relatedContact: stub
  relatedEvent: stub



  initialize: ->
    @collection.App.events.getOrFetch @get("event_id"), (model) =>
      @relatedEvent = model
      @relatedEvent.on "change", => @trigger "change"
      @relatedEvent.trigger "change"

    @relatedContact = @collection.App.contacts.getOrFetch @get("contact_id"), (model) =>
      @relatedContact = model
      @relatedContact.on "change", => @trigger "change"
      @relatedContact.trigger "change"






