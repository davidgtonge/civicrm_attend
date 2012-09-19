cj ->

  container = cj(".crm-event-actions")
  container.find("div:last").before """
  <div class="crm-event-more"><span id="sc_attend" class="btn-slide">Attendence</span></div>
  """
  url = container.find('a:first').attr("href")
  id = url.charAt (url.length - 1)
  container.find('#sc_attend').click ->
    window.location.hash = "/event/#{id}"
    require "../initialize"
