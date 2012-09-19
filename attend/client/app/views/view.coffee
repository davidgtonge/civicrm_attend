require 'lib/view_helper'
template = require "./templates/default"

# Base class for all views.
module.exports = class View extends Backbone.View
  template: template

  init: ->
  initialize: (options) ->
    @init(options)
    @modelOn "change", @render
    @collectionOn "change add remove", @render
    @eventOn "change", @render
    @collectionOn "all", -> console.log arguments

  modelOn: (event, callback) ->
    @model?.on event, callback, @
  collectionOn: (event, callback) ->
    @collection?.on event, callback, @
  eventOn: (event, callback) ->
    @options.event?.on event, callback, @
  contactsOn: (event, callback) ->
    @options.contacts?.on event, callback, @

  dispose: ->
    @model?.off null, null, @
    @collection?.off null, null, @
    @options.event?.off null, null, @
    @options.contact?.off null, null, @
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
