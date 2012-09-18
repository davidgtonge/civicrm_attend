$ = cj
app = require "../application"

# View Classes
contactEventView = require "../views/contactEvent"
contactView = require "../views/contact"
eventDateView = require "../views/eventDate"
eventView = require "../views/event"



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
    model = app.contacts.getOrFetch(cid)
    event = app.events.getOrFetch(eid)
    collection = app.records.getByContact(cid)
    view = new contactEventView {model, event, collection}
    @render view

  contact: (cid) ->
    model = app.contacts.getOrFetch(cid)
    collection = app.records.getByContact(cid)
    view = new contactView {model, collection}
    @render view

  eventDate: (eid, date) ->
    model = app.events.getOrFetch(eid)
    collection = app.records.getByEvent(eid).getByDate(date)
    view = new eventDateView {model, collection, date}

    window.dave3 = {model,  collection, date}
    @render view

  event: (eid) ->
    model = app.events.getOrFetch(eid)
    collection = app.records.getByEvent(eid)
    view = new eventView {model, collection}
    @render view

  render: (view) ->
    @$el.dialog "close"
    @$el.html view.render().el
    @$el.dialog "open"