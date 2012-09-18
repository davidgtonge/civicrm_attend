Model = require "./model"

module.exports = class ContactModel extends Model
  entity:"contact"
  methodMap:
    create: false
    update: false
    read: "get"
    delete: false


