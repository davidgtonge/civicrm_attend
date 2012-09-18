View = require "./view"
RecordView = require "./record"
template = require "./templates/contactEvent"

module.exports = class ContactEvent extends View
  template:template
  getRenderData: =>
    data =
      title:"Contact Event"
      contact: @model.toJSON()
      event: @options.event.toJSON()
    console.log data
    window.dave2 = @
    data

  events:
    "click .add" : "addRecord"

  afterRender: =>
    views = (new RecordView {model} for model in @collection.models)
    @$('.records').append(view.render().el for view in views)
    jQuery(@$('.date')[0]).Zebra_DatePicker
      onSelect: (a,b,date) => @date = date

  addRecord: =>
    if @date
      record = @collection.create
        date:@date
        contact_id:@model.id
        event_id:@options.event.id
      view = new RecordView {model:record}
      @$('records').append view.render().el
    false



