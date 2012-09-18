Model = require "./model"

module.exports = class EventModel extends Model
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


