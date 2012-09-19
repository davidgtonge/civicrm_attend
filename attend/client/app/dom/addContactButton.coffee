cj ->

  container = cj("#mainTabContainer").tabs("add", "#attemd", "attemdence")
  tab = container.find("ul li:last").addClass("crm-tab-button")
  link = tab.find('a').html """
   <span> </span> Attendence <em></em>
  """
  url = cj('#actions .edit').attr("href")
  id = url.charAt (url.length - 1)

  link.click ->
    window.location.hash = "/contact/#{id}"
    require "../initialize"