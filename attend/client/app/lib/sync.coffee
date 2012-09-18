

formatForServer = (data) ->
  for key, val of data
    switch key
      when "date"
        data[key] = (new XDate(val)).toString("yyyyMMdd")
  data


formatForClient = (data) ->
  for key, val of data
    switch key
      when "date"
        date = new XDate(val)
        unless date.valid()
          val = "#{val.substr(0,4)}-#{val.substr(4,2)}-#{val.substr(6,2)}"
          date = new XDate(val)
        data[key] = new XDate(val)
      when "event_id", "contact_id"
        data[key] = parseInt(val,10)
  data


module.exports = (method, model, options = {}) ->

  action = model.methodMap[method]
  throw new Error("#{action} not permitted") unless action

  base = Drupal.settings.basePath
  options.url = base + "civicrm/ajax/rest"
  options.data = formatForServer model.toJSON()
  options.data.entity = model.entity
  options.data.action = action
  options.data.json = 1
  options.dataType = "json"

  success = options.success
  options.success = (data, textStatus, jqXHR) ->
    if data.is_error
      options.error jqXHR, textStatus, "API Error"
    else if data.count is 0
      options.error jqXHR, textStatus, "No record found"
    else
      if data.values and data.id
        modelData = data.values[data.id]
      else if _.isArray(data)
        modelData = data[0]
      else
        modelData = data

      console.log modelData
      success formatForClient(modelData), textStatus, jqXHR

  cj.ajax(options)
