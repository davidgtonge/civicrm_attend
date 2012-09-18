Model = require "./model"

module.exports = class EventModel extends Model
  entity:"event"
  methodMap:
    create: false
    update: false
    read: "get"
    delete: false



