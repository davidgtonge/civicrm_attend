# Base class for all collections.
module.exports = class Collection extends Backbone.Collection

  getOrFetch: (id) ->
    model = @get id
    unless model
      model = new @model {id}
      model.fetch()
      @add model
    model

