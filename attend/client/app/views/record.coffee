View = require "./view"
template = require "./templates/record"

module.exports = class Record extends View
  template:template
  events:
    "click .delete": "deleteRecord"

  deleteRecord: =>
    if confirm "Are you sure you want to delete this record"
      @model.destroy()
      @dispose()
    false

  getRenderData: ->
    data = @model.toJSON()
    console.log data
    data

