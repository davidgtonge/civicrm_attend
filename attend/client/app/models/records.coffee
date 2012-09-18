$ = cj
Record = require "./record"
Collection = require "./collection"
contactFetches = []
eventFetches = []


module.exports = class Records extends Collection
  model:Record

  makeChild: ->
    child = new Records
    child.app = @app
    child

  getByContact: (contact_id) ->
    filtered = @makeChild()

    if contact_id in contactFetches
      filtered.add @App.records.where {contact_id}
    else
      contactFetches.push contact_id
      @fetch {contact_id}, filtered
    filtered

  getByEvent: (event_id) ->
    filtered = @makeChild()
    if event_id in eventFetches
      filtered.add @App.records.where {event_id}
    else
      eventFetches.push event_id
      @fetch {event_id}, filtered
    filtered

  getByDate: (date) ->
    filtered = new Records @filter (model) ->
      console.log date, model.get("date")
      date is model.get("date")


  getEvents: -> _.unique (model.relatedEvent for model in @models)
  getContacts: -> _.unique (model.relatedContact for model in @models)
  getDates: -> _.unique @pluck "date"

  fetch: (query = {}, filtered, done) =>
    base = Drupal.settings.basePath
    url = base + "civicrm/ajax/rest"
    query.entity = "attend"
    query.action = "get_contact_record"
    query.json = 1
    $.getJSON url, query, (records) =>
      if _.isArray(records)
        for record in records
          model = @App.records.get(record.id)
          unless model
            @App.records.add record
            model = @App.records.get(record.id)
          @add model unless @get(model.id)
          if filtered
            filtered.add(model) unless filtered.get(model.id)


