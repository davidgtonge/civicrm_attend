(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  var Application, Cache, Contacts, Events, Records, collection, debug, _i, _len, _ref;

  Contacts = require("./models/contacts");

  Events = require("./models/events");

  Records = require("./models/records");

  Cache = require("./lib/cache");

  debug = function() {
    return console.log(arguments);
  };

  Application = {
    records: new Records,
    contacts: new Contacts,
    events: new Events,
    initialize: function() {
      var Router;
      Router = require('lib/router');
      return this.router = new Router();
    }
  };

  module.exports = Application;

  window.dave = Application;

  _ref = ["records", "contacts", "events"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    collection = _ref[_i];
    Application[collection].on("all", debug);
    Application[collection].App = Application;
  }
  
}});

window.require.define({"dom/addContactButton": function(exports, require, module) {
  
  cj(function() {
    var container, id, link, tab, url;
    container = cj("#mainTabContainer").tabs("add", "#attemd", "attemdence");
    tab = container.find("ul li:last").addClass("crm-tab-button");
    link = tab.find('a').html("<span> </span> Attendence <em></em>");
    url = cj('#actions .edit').attr("href");
    id = url.charAt(url.length - 1);
    return link.click(function() {
      window.location.hash = "/contact/" + id;
      require("../initialize");
      return alert("show attendance for cid " + id);
    });
  });
  
}});

window.require.define({"dom/addEventButton": function(exports, require, module) {
  
  cj(function() {
    var container, id, url;
    container = cj(".crm-event-actions");
    container.find("div:last").before("<div class=\"crm-event-more\"><span id=\"sc_attend\" class=\"btn-slide\">Attendence</span></div>");
    url = container.find('a:first').attr("href");
    id = url.charAt(url.length - 1);
    return container.find('#sc_attend').click(function() {
      window.location.hash = "/event/" + id;
      require("../initialize");
      return alert("show attedance for eid: " + id);
    });
  });
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var application;

  Backbone.sync = require("lib/sync");

  Backbone.setDomLibrary(cj);

  application = require('application');

  cj(function() {
    application.initialize();
    return Backbone.history.start();
  });
  
}});

window.require.define({"lib/cache": function(exports, require, module) {
  var Store, idCounter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  idCounter = 0;

  module.exports = Store = (function() {

    function Store(opts) {
      this.opts = opts;
      this.remove = __bind(this.remove, this);

      this._limit = this.opts.limit;
      this._data = {};
      this._keys = [];
    }

    Store.prototype.get = function(key) {
      var cached, val;
      cached = this._data[key];
      if (!cached && this.opts.getter) {
        val = this.opts.getter(key);
        if (val) {
          this.set(key, val, this.opts.expires);
          cached = val;
        }
      }
      return cached;
    };

    Store.prototype.getAsync = function(key, expires, callback) {
      var cached, fn,
        _this = this;
      cached = this.get(key);
      if (this.get(key)) {
        fn = function() {
          return callback(null, cached);
        };
        return setTimeout(fn, 1);
      } else {
        if (this.opts.getter) {
          return this.opts.getter(key, function(err, result) {
            if (!err && result) {
              _this.set(key, result, callback);
            }
            return callback(err, result);
          });
        } else {
          fn = function() {
            return callback("No Getter");
          };
          return setTimeout(fn, 1);
        }
      }
    };

    Store.prototype.mget = function(keys) {
      var found, key, missing, results, _i, _len;
      results = {};
      missing = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        found = this.get(key);
        if (found) {
          results[key] = found;
        } else {
          missing.push(key);
        }
      }
      return [results, missing];
    };

    Store.prototype.mset = function(data, expires) {
      var key, vars, _results;
      if (expires == null) {
        expires = false;
      }
      _results = [];
      for (key in data) {
        vars = data[key];
        _results.push(this.set(key, vars, expires));
      }
      return _results;
    };

    Store.prototype.set = function(key, vars, expires) {
      if (expires == null) {
        expires = false;
      }
      if (this._data[key]) {
        this._splice(key);
      }
      this._data[key] = vars;
      this._keys.push(key);
      if (this._keys.length > this._limit) {
        this._shift();
      }
      if (expires) {
        return setTimeout(this.remove, expires, key);
      }
    };

    Store.prototype.add = function(vars) {
      var key;
      key = "jsc_" + idCounter++;
      this.set(key, vars);
      return key;
    };

    Store.prototype.mremove = function(keys) {
      var key, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push(this.remove(key));
      }
      return _results;
    };

    Store.prototype.remove = function(key) {
      if (this._data[key]) {
        delete this._data[key];
        return this._splice(key);
      }
    };

    Store.prototype.clear = function() {
      this._data = {};
      return this._keys = [];
    };

    Store.prototype.size = function() {
      return this._keys.length;
    };

    Store.prototype._shift = function() {
      return delete this._data[this._keys.shift()];
    };

    Store.prototype._splice = function(key) {
      return this._keys.splice(this._keys.indexOf(key), 1);
    };

    return Store;

  })();
  
}});

window.require.define({"lib/router": function(exports, require, module) {
  var $, Router, app, contactEventView, contactView, eventDateView, eventView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = cj;

  app = require("../application");

  contactEventView = require("../views/contactEvent");

  contactView = require("../views/contact");

  eventDateView = require("../views/eventDate");

  eventView = require("../views/event");

  module.exports = Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.initialize = function() {
      $('body').append("<div id='sc_dialog'></div>");
      return this.$el = $('#sc_dialog').dialog({
        autoOpen: false
      });
    };

    Router.prototype.routes = {
      "contact/:cid/:eid": "contactEvent",
      "contact/:cid": "contact",
      "event/:eid/:date": "eventDate",
      "event/:eid": "event"
    };

    Router.prototype.contactEvent = function(cid, eid) {
      var collection, event, model, view;
      model = app.contacts.getOrFetch(cid);
      event = app.events.getOrFetch(eid);
      collection = app.records.getByContact(cid);
      console.log({
        model: model,
        event: event,
        collection: collection,
        cid: cid,
        eid: eid
      });
      view = new contactEventView({
        model: model,
        event: event,
        collection: collection
      });
      return this.render(view);
    };

    Router.prototype.contact = function(cid) {
      var collection, model, view;
      model = app.contacts.getOrFetch(cid);
      collection = app.records.getByContact(cid);
      view = new contactView({
        model: model,
        collection: collection
      });
      return this.render(view);
    };

    Router.prototype.eventDate = function(eid, date) {
      var collection, model, view;
      model = app.events.getOrFetch(eid);
      collection = app.records.getByEvent(eid);
      view = new eventDateView({
        model: model,
        collection: collection,
        date: date
      });
      return this.render(view);
    };

    Router.prototype.event = function(eid) {
      var collection, model, view;
      model = app.events.getOrFetch(eid);
      collection = app.records.getByEvent(eid);
      view = new eventView({
        model: model,
        collection: collection
      });
      return this.render(view);
    };

    Router.prototype.render = function(view) {
      this.$el.dialog("close");
      this.$el.html(view.render().el);
      return this.$el.dialog("open");
    };

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"lib/sync": function(exports, require, module) {
  var formatForClient, formatForServer;

  formatForServer = function(data) {
    var key, val;
    for (key in data) {
      val = data[key];
      switch (key) {
        case "date":
          data[key] = (new XDate(val)).toString("yyyyMMdd");
      }
    }
    return data;
  };

  formatForClient = function(data) {
    var date, key, val;
    for (key in data) {
      val = data[key];
      switch (key) {
        case "date":
          date = new XDate(val);
          if (!date.valid()) {
            val = "" + (val.substr(0, 4)) + "-" + (val.substr(4, 2)) + "-" + (val.substr(6, 2));
            date = new XDate(val);
          }
          data[key] = new XDate(val);
          break;
        case "event_id":
        case "contact_id":
          data[key] = parseInt(val, 10);
      }
    }
    return data;
  };

  module.exports = function(method, model, options) {
    var action, base, success;
    if (options == null) {
      options = {};
    }
    action = model.methodMap[method];
    if (!action) {
      throw new Error("" + action + " not permitted");
    }
    base = Drupal.settings.basePath;
    options.url = base + "civicrm/ajax/rest";
    options.data = formatForServer(model.toJSON());
    options.data.entity = model.entity;
    options.data.action = action;
    options.data.json = 1;
    options.dataType = "json";
    success = options.success;
    options.success = function(data, textStatus, jqXHR) {
      var modelData;
      if (data.is_error) {
        return options.error(jqXHR, textStatus, "API Error");
      } else if (data.count === 0) {
        return options.error(jqXHR, textStatus, "No record found");
      } else {
        if (data.values && data.id) {
          modelData = data.values[data.id];
        } else if (_.isArray(data)) {
          modelData = data[0];
        } else {
          modelData = data;
        }
        console.log(modelData);
        return success(formatForClient(modelData), textStatus, jqXHR);
      }
    };
    return cj.ajax(options);
  };
  
}});

window.require.define({"lib/view_helper": function(exports, require, module) {
  

  
}});

window.require.define({"models/collection": function(exports, require, module) {
  var Collection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.getOrFetch = function(id) {
      var model;
      model = this.get(id);
      if (!model) {
        model = new this.model({
          id: id
        });
        model.fetch();
        this.add(model);
      }
      return model;
    };

    return Collection;

  })(Backbone.Collection);
  
}});

window.require.define({"models/contact": function(exports, require, module) {
  var ContactModel, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require("./model");

  module.exports = ContactModel = (function(_super) {

    __extends(ContactModel, _super);

    function ContactModel() {
      return ContactModel.__super__.constructor.apply(this, arguments);
    }

    ContactModel.prototype.entity = "contact";

    ContactModel.prototype.methodMap = {
      create: false,
      update: false,
      read: "get",
      "delete": false
    };

    return ContactModel;

  })(Model);
  
}});

window.require.define({"models/contacts": function(exports, require, module) {
  var Collection, Contact, Contacts,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Contact = require("./contact");

  Collection = require("./collection");

  module.exports = Contacts = (function(_super) {

    __extends(Contacts, _super);

    function Contacts() {
      return Contacts.__super__.constructor.apply(this, arguments);
    }

    Contacts.prototype.model = Contact;

    return Contacts;

  })(Collection);
  
}});

window.require.define({"models/event": function(exports, require, module) {
  var EventModel, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require("./model");

  module.exports = EventModel = (function(_super) {

    __extends(EventModel, _super);

    function EventModel() {
      return EventModel.__super__.constructor.apply(this, arguments);
    }

    EventModel.prototype.entity = "event";

    EventModel.prototype.methodMap = {
      create: false,
      update: false,
      read: "get",
      "delete": false
    };

    return EventModel;

  })(Model);
  
}});

window.require.define({"models/events": function(exports, require, module) {
  var Collection, Event, Events,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Event = require("./event");

  Collection = require("./collection");

  module.exports = Events = (function(_super) {

    __extends(Events, _super);

    function Events() {
      return Events.__super__.constructor.apply(this, arguments);
    }

    Events.prototype.model = Event;

    return Events;

  })(Collection);
  
}});

window.require.define({"models/model": function(exports, require, module) {
  var Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Model = (function(_super) {

    __extends(Model, _super);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    return Model;

  })(Backbone.Model);
  
}});

window.require.define({"models/record": function(exports, require, module) {
  var EventModel, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require("./model");

  module.exports = EventModel = (function(_super) {

    __extends(EventModel, _super);

    function EventModel() {
      return EventModel.__super__.constructor.apply(this, arguments);
    }

    EventModel.prototype.methodMap = {
      create: "create_contact_record",
      update: "set_contact_record",
      read: "get_contact_record",
      "delete": "delete_contact_record"
    };

    EventModel.prototype.entity = "attend";

    EventModel.prototype.toJSON = function() {
      var data;
      data = EventModel.__super__.toJSON.apply(this, arguments);
      if (!_.isString(data.date)) {
        data.date = data.date.toString("yyyy-MM-dd");
      }
      return data;
    };

    return EventModel;

  })(Model);
  
}});

window.require.define({"models/records": function(exports, require, module) {
  var $, Collection, Record, Records,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = cj;

  Record = require("./record");

  Collection = require("./collection");

  module.exports = Records = (function(_super) {

    __extends(Records, _super);

    function Records() {
      this.fetch = __bind(this.fetch, this);
      return Records.__super__.constructor.apply(this, arguments);
    }

    Records.prototype.model = Record;

    Records.prototype.contactFetches = [];

    Records.prototype.eventFetches = [];

    Records.prototype.getByContact = function(contact_id) {
      var filtered;
      filtered = new Records;
      if (__indexOf.call(this.contactFetches, contact_id) >= 0) {
        filtered.add(this.where({
          contact_id: contact_id
        }));
      } else {
        this.contactFetches.push(contact_id);
        this.fetch({
          contact_id: contact_id
        }, filtered);
      }
      return filtered;
    };

    Records.prototype.getByEvent = function(event_id) {
      var filtered;
      filtered = new Records;
      if (__indexOf.call(this.eventFetches, event_id) >= 0) {
        filtered.add(this.where({
          event_id: event_id
        }));
      } else {
        this.eventFetches.push(event_id);
        this.fetch({
          event_id: event_id
        }, filtered);
      }
      return filtered;
    };

    Records.prototype.getEvents = function() {
      var model;
      return _.unique((function() {
        var _i, _len, _ref, _results;
        _ref = this.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(model.relatedEvent);
        }
        return _results;
      }).call(this));
    };

    Records.prototype.getContacts = function() {
      var model;
      return _.unique((function() {
        var _i, _len, _ref, _results;
        _ref = this.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(model.relatedContact);
        }
        return _results;
      }).call(this));
    };

    Records.prototype.fetch = function(query, filtered) {
      var base, url,
        _this = this;
      if (query == null) {
        query = {};
      }
      base = Drupal.settings.basePath;
      url = base + "civicrm/ajax/rest";
      query.entity = "attend";
      query.action = "get_contact_record";
      query.json = 1;
      return $.getJSON(url, query, function(records) {
        if (_.isArray(records)) {
          _this.add(records);
          if (filtered) {
            filtered.add(records);
            return _this.getRelated(filtered);
          }
        }
      });
    };

    Records.prototype.getRelated = function(filtered) {
      var model, _i, _len, _ref, _results;
      _ref = filtered.models;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        model.relatedEvent = this.App.events.getOrFetch(model.get("event_id"));
        model.relatedEvent.on("change", function() {
          return model.trigger("change");
        });
        model.relatedContact = this.App.contacts.getOrFetch(model.get("contact_id"));
        _results.push(model.relatedContact.on("change", function() {
          return model.trigger("change");
        }));
      }
      return _results;
    };

    return Records;

  })(Collection);
  
}});

window.require.define({"views/contact": function(exports, require, module) {
  var ContactView, View, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  template = require("./templates/contact");

  module.exports = ContactView = (function(_super) {

    __extends(ContactView, _super);

    function ContactView() {
      return ContactView.__super__.constructor.apply(this, arguments);
    }

    ContactView.prototype.template = template;

    ContactView.prototype.getRenderData = function() {
      var model;
      return {
        contact: this.model.toJSON(),
        events: (function() {
          var _i, _len, _ref, _results;
          _ref = this.collection.getEvents();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(model.toJSON());
          }
          return _results;
        }).call(this),
        title: "Attendence Record"
      };
    };

    return ContactView;

  })(View);
  
}});

window.require.define({"views/contactEvent": function(exports, require, module) {
  var ContactEvent, RecordView, View, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  RecordView = require("./record");

  template = require("./templates/contactEvent");

  module.exports = ContactEvent = (function(_super) {

    __extends(ContactEvent, _super);

    function ContactEvent() {
      this.addRecord = __bind(this.addRecord, this);

      this.afterRender = __bind(this.afterRender, this);

      this.getRenderData = __bind(this.getRenderData, this);
      return ContactEvent.__super__.constructor.apply(this, arguments);
    }

    ContactEvent.prototype.template = template;

    ContactEvent.prototype.getRenderData = function() {
      var data;
      data = {
        title: "Contact Event",
        contact: this.model.toJSON(),
        event: this.options.event.toJSON()
      };
      console.log(data);
      window.dave2 = this;
      return data;
    };

    ContactEvent.prototype.events = {
      "click .add": "addRecord"
    };

    ContactEvent.prototype.afterRender = function() {
      var model, view, views,
        _this = this;
      views = (function() {
        var _i, _len, _ref, _results;
        _ref = this.collection.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(new RecordView({
            model: model
          }));
        }
        return _results;
      }).call(this);
      this.$('.records').append((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = views.length; _i < _len; _i++) {
          view = views[_i];
          _results.push(view.render().el);
        }
        return _results;
      })());
      return jQuery(this.$('.date')[0]).Zebra_DatePicker({
        onSelect: function(a, b, date) {
          return _this.date = date;
        }
      });
    };

    ContactEvent.prototype.addRecord = function() {
      var record, view;
      if (this.date) {
        record = this.collection.create({
          date: this.date,
          contact_id: this.model.id,
          event_id: this.options.event.id
        });
        view = new RecordView({
          model: record
        });
        this.$('records').append(view.render().el);
      }
      return false;
    };

    return ContactEvent;

  })(View);
  
}});

window.require.define({"views/contactEventDate": function(exports, require, module) {
  var ContactEventDate, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  module.exports = ContactEventDate = (function(_super) {

    __extends(ContactEventDate, _super);

    function ContactEventDate() {
      return ContactEventDate.__super__.constructor.apply(this, arguments);
    }

    ContactEventDate.prototype.getRenderData = function() {
      return {
        title: "Contact Event Date"
      };
    };

    return ContactEventDate;

  })(View);
  
}});

window.require.define({"views/event": function(exports, require, module) {
  var Event, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  module.exports = Event = (function(_super) {

    __extends(Event, _super);

    function Event() {
      return Event.__super__.constructor.apply(this, arguments);
    }

    Event.prototype.getRenderData = function() {
      return {
        event: this.model.toJSON()
      };
    };

    return Event;

  })(View);
  
}});

window.require.define({"views/eventDate": function(exports, require, module) {
  var EventDate, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  module.exports = EventDate = (function(_super) {

    __extends(EventDate, _super);

    function EventDate() {
      return EventDate.__super__.constructor.apply(this, arguments);
    }

    EventDate.prototype.getRenderData = function() {
      return {
        title: "Event Date"
      };
    };

    return EventDate;

  })(View);
  
}});

window.require.define({"views/home_view": function(exports, require, module) {
  var HomeView, View, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('./view');

  template = require('./templates/home');

  module.exports = HomeView = (function(_super) {

    __extends(HomeView, _super);

    function HomeView() {
      return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    HomeView.prototype.template = template;

    return HomeView;

  })(View);
  
}});

window.require.define({"views/record": function(exports, require, module) {
  var Record, View, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("./view");

  template = require("./templates/record");

  module.exports = Record = (function(_super) {

    __extends(Record, _super);

    function Record() {
      this.deleteRecord = __bind(this.deleteRecord, this);
      return Record.__super__.constructor.apply(this, arguments);
    }

    Record.prototype.template = template;

    Record.prototype.events = {
      "click .delete": "deleteRecord"
    };

    Record.prototype.deleteRecord = function() {
      if (confirm("Are you sure you want to delete this record")) {
        this.model.destroy();
        this.dispose();
      }
      return false;
    };

    Record.prototype.getRenderData = function() {
      var data;
      data = this.model.toJSON();
      console.log(data);
      return data;
    };

    return Record;

  })(View);
  
}});

window.require.define({"views/templates/contact": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data,depth1) {
    
    var buffer = "", stack1;
    buffer += "\n    <li><a href=\"#/contact/";
    foundHelper = helpers.contact;
    stack1 = foundHelper || depth1.contact;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.id);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...contact.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.event_title;
    stack1 = foundHelper || depth0.event_title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "event_title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></li>\n    ";
    return buffer;}

    buffer += "<h1>";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h1>\n\n<p>";
    foundHelper = helpers.contact;
    stack1 = foundHelper || depth0.contact;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display_name);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "contact.display_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + " has attended the following events:</p>\n<ul>\n    ";
    foundHelper = helpers.events;
    stack1 = foundHelper || depth0.events;
    stack2 = helpers.each;
    tmp1 = self.programWithDepth(program1, data, depth0);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</ul>";
    return buffer;});
}});

window.require.define({"views/templates/contactEvent": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<h1>";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h1>\n<p>Attendence for ";
    foundHelper = helpers.contact;
    stack1 = foundHelper || depth0.contact;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.display_name);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "contact.display_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</p>\n<h3>Event: ";
    foundHelper = helpers.event;
    stack1 = foundHelper || depth0.event;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.title);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "event.title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h3>\n<div class=\"records\"></div>\n\n<label>Add attendence record</label>\n<input class=\"date\" name=\"date\" type=\"text\" />\n<button class=\"add\">Add</button>\n";
    return buffer;});
}});

window.require.define({"views/templates/default": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<h1>";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h1>";
    return buffer;});
}});

window.require.define({"views/templates/home": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"content\">\n  <h1>brunch</h1>\n  <h2>Welcome!</h2>\n  <ul>\n    <li><a href=\"http://brunch.readthedocs.org/\">Documentation</a></li>\n    <li><a href=\"https://github.com/brunch/brunch/issues\">Github Issues</a></li>\n    <li><a href=\"https://github.com/brunch/twitter\">Twitter Example App</a></li>\n    <li><a href=\"https://github.com/brunch/todos\">Todos Example App</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/record": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<span>";
    foundHelper = helpers.date;
    stack1 = foundHelper || depth0.date;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span> - <a class=\"delete\" href=\"#\">Delete</a>";
    return buffer;});
}});

window.require.define({"views/view": function(exports, require, module) {
  var View, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require('lib/view_helper');

  template = require("./templates/default");

  module.exports = View = (function(_super) {

    __extends(View, _super);

    function View() {
      this.render = __bind(this.render, this);
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.template = template;

    View.prototype.init = function() {};

    View.prototype.initialize = function(options) {
      this.init(options);
      this.modelOn("change", this.render);
      this.collectionOn("change", this.render);
      return this.eventOn("change", this.render);
    };

    View.prototype.modelOn = function(event, callback) {
      var _ref;
      return (_ref = this.model) != null ? _ref.on(event, callback, this) : void 0;
    };

    View.prototype.collectionOn = function(event, callback) {
      var _ref;
      return (_ref = this.collection) != null ? _ref.on(event, callback, this) : void 0;
    };

    View.prototype.eventOn = function(event, callback) {
      var _ref;
      return (_ref = this.event) != null ? _ref.on(event, callback, this) : void 0;
    };

    View.prototype.dispose = function() {
      var _ref, _ref1, _ref2;
      if ((_ref = this.model) != null) {
        _ref.off(null, null, this);
      }
      if ((_ref1 = this.collection) != null) {
        _ref1.off(null, null, this);
      }
      if ((_ref2 = this.options.event) != null) {
        _ref2.off(null, null, this);
      }
      return this.remove();
    };

    View.prototype.getRenderData = function() {};

    View.prototype.render = function() {
      this.$el.html(this.template(this.getRenderData()));
      this.afterRender();
      return this;
    };

    View.prototype.afterRender = function() {};

    return View;

  })(Backbone.View);
  
}});

