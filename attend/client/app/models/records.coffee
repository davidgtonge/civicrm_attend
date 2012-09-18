$ = cj
Record = require "./record"
Collection = require "./collection"


module.exports = class Records extends Collection
  model:Record
  contactFetches: []
  eventFetches: []

  getByContact: (contact_id) ->
    filtered = new Records
    if contact_id in @contactFetches
      filtered.add @where {contact_id}
    else
      @contactFetches.push contact_id
      @fetch {contact_id}, filtered
    filtered

  getByEvent: (event_id) ->
    filtered = new Records
    if event_id in @eventFetches
      filtered.add @where {event_id}
    else
      @eventFetches.push event_id
      @fetch {event_id}, filtered
    filtered

  getEvents: -> _.unique (model.relatedEvent for model in @models)
  getContacts: -> _.unique (model.relatedContact for model in @models)

  fetch: (query = {}, filtered) =>
    base = Drupal.settings.basePath
    url = base + "civicrm/ajax/rest"
    query.entity = "attend"
    query.action = "get_contact_record"
    query.json = 1
    $.getJSON url, query, (records) =>
      if _.isArray(records)
        @add records
        if filtered
          filtered.add records
          @getRelated(filtered)

  getRelated: (filtered) ->
    for model in filtered.models
      model.relatedEvent = @App.events.getOrFetch(model.get "event_id")
      model.relatedEvent.on "change", -> model.trigger "change"
      model.relatedContact = @App.contacts.getOrFetch(model.get "contact_id")
      model.relatedContact.on "change", -> model.trigger "change"



