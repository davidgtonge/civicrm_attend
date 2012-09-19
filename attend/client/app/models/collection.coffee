# Base class for all collections.
module.exports = class Collection extends Backbone.Collection

  getOrFetch: (id, callback) ->
    model = @get id
    if model
      callback model
    else
      model = new @model {id}
      model.fetch
        success: =>
          cached = @get id
          if cached
            cached.set model.toJSON()
            callback cached
          else
            @add model
            callback model

