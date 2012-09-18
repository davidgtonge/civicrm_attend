# The application bootstrapper.
# Model / Collection Classes
Contacts = require "./models/contacts"
Events = require "./models/events"
Records = require "./models/records"

# Cache Setup
Cache = require "./lib/cache"
debug = -> console.log arguments


Application =
  records: new Records
  contacts: new Contacts
  events: new Events

  initialize: ->
    Router = require 'lib/router'
    # Instantiate the router
    @router = new Router()


module.exports = Application
window.dave = Application

for collection in  ["records","contacts","events"]
  Application[collection].on "all", debug
  Application[collection].App = Application