function myFunction() {
  const sheets_log = SpreadsheetApp.openById('1PWb3ih0KuZmIrJG75yM0LSWZ4vfoLL7wiaoajB88b2o');
  const sheets = sheets_log.getSheets();
  for(let i=0; i<sheets.length; i++){
    Logger.log(sheets[i].getSheetName());
    if(sheets[i].getSheetName().substring(6, 0) == 'temp の'){
      Logger.log('削除' + sheets[i].getSheetName());
      sheets_log.deleteSheet(sheets[i]);
    }
  }
}
