$ = cj
app = require "../application"

# View Classes
contactEventView = require "../views/contactEvent"
contactView = require "../views/contact"
eventDateView = require "../views/eventDate"
eventView = require "../views/event"

class Async
  counter:0
  add: (name, method) ->
    @counter += 1
    @fns[name] = method

  fns:{}
  check: ->
    @finish() if @counter is 0

  run: (@finish) ->
    for name, fn of @fns
      do (name, fn) =>
        fn (result) =>
          @[name] = result
          @counter -= 1
          @check()


# The Actual Router
module.exports = class Router extends Backbone.Router

  initialize: ->
    $('body').append("<div id='sc_dialog'></div>")
    @$el = $('#sc_dialog').dialog
      autoOpen:false


  routes:
    "contact/:cid/:eid" : "contactEvent"
    "contact/:cid" : "contact"
    "event/:eid/:date" : "eventDate"
    "event/:eid" : "event"


  contactEvent: (cid, eid) ->
    async = new Async
    async.add "model", (cb) ->
      app.contacts.getOrFetch(cid, cb)
    async.add "event", (cb) ->
      app.events.getOrFetch(eid, cb)
    collection = app.records.getByContact(cid)
    async.run =>
      view = new contactEventView {model:async.model, event:async.event, collection}
      @render view


  contact: (cid) ->
    async = new Async
    async.add "model", (cb) -> app.contacts.getOrFetch(cid, cb)
    collection = app.records.getByContact(cid)
    async.run =>
      view = new contactView {model:async.model, collection}
      @render view

  eventDate: (eid, date) ->
    async = new Async
    async.add "model", (cb) -> app.events.getOrFetch(eid, cb)
    collection = app.records.getByEvent(eid).getByDate(date)
    contacts = app.contacts.getByEvent(eid)
    async.run =>
      view = new eventDateView {model:async.model, collection, contacts, date}
      @render view

  event: (eid) ->
    async = new Async
    async.add "model", (cb) -> app.events.getOrFetch(eid, cb)
    collection = app.records.getByEvent(eid)
    contacts = app.contacts.getByEvent(eid)
    async.run =>
      view = new eventView {model:async.model, collection, contacts}
      @render view

  render: (view) ->
    @$el.dialog "close"
    @$el.html view.render().el
    @$el.dialog "open"