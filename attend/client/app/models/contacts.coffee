Contact = require "./contact"
Collection = require "./collection"
$ = cj
eventFetches = []

module.exports = class Contacts extends Collection
  model:Contact

  makeChild: ->
    child = new Contacts
    child.App = @App
    child

  getByEvent: (event_id) ->
    filtered = @makeChild()
    if event_id in eventFetches
      filtered.add @App.contacts.where {event_id}
    else
      eventFetches.push event_id
      @fetch {event_id}, filtered
    filtered


  fetch: (query = {}, filtered) =>
    base = Drupal.settings.basePath
    url = base + "civicrm/ajax/rest"
    query.entity = "contact"
    query.action = "get"
    query.json = 1
    $.getJSON url, query, (result) =>
      contacts = result.values
      if _.isObject(contacts) and not _.isArray(contacts)
        for id, contact of contacts
          model = @App.contacts.get(contact.id)
          if model
            model.get("event_ids").push contact.event_id
            model.trigger "change", "event_id", contact.event_id
          else
            contact.event_ids = [contact.event_id]
            delete contact.event_id
            @App.contacts.add contact
            model = @App.contacts.get(contact.id)
          @add model unless @get(model.id)
          if filtered
            filtered.add(model) unless filtered.get(model.id)