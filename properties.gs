function properties(){
  const prop = PropertiesService.getScriptProperties();

  Logger.log(prop.getProperties());
}

function set_property(){
  const prop = PropertiesService.getScriptProperties();

  prop.setProperty();

  Logger.log(prop.getProperties());
}