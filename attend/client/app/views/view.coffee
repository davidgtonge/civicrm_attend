require 'lib/view_helper'
template = require "./templates/default"

# Base class for all views.
module.exports = class View extends Backbone.View
  template: template

  init: ->
  initialize: (options) ->
    @init(options)
    @modelOn "change", @render
    @collectionOn "change", @render
    @eventOn "change", @render

  modelOn: (event, callback) ->
    @model?.on event, callback, @
  collectionOn: (event, callback) ->
    @collection?.on event, callback, @
  eventOn: (event, callback) ->
    @event?.on event, callback, @

  dispose: ->
    @model?.off null, null, @
    @collection?.off null, null, @
    @options.event?.off null, null, @
    @remove()

  getRenderData: ->
    return

  render: =>
    #console.debug "Rendering #{@constructor.name}"
    @$el.html @template @getRenderData()
    @afterRender()
    this

  afterRender: ->
    return
