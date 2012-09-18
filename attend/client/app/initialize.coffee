  # Overwrite Backbone sync with civi specific method
Backbone.sync = require "lib/sync"
Backbone.setDomLibrary(cj)

application = require 'application'


cj ->
  application.initialize()
  Backbone.history.start()
