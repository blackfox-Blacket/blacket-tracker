function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const action = e?.parameter?.action;
  
  if (action === 'getPrices') {
    const data = sheet.getSheetByName('prices').getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data.slice(1))).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getSales') {
    const data = sheet.getSheetByName('sales').getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data.slice(1))).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getListings') {
    const data = sheet.getSheetByName('listings').getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(data.slice(1))).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'addPrice') {
    const sheetName = sheet.getSheetByName('prices');
    sheetName.appendRow([new Date().toISOString(), e.parameter.blook, e.parameter.avg, e.parameter.count]);
    return ContentService.createTextOutput('ok');
  }
  
  if (action === 'addSale') {
    const sheetName = sheet.getSheetByName('sales');
    sheetName.appendRow([new Date().toISOString(), e.parameter.blook, e.parameter.price, e.parameter.seller]);
    return ContentService.createTextOutput('ok');
  }
  
  if (action === 'addListings') {
    const sheetName = sheet.getSheetByName('listings');
    const listings = JSON.parse(e.parameter.data);
    listings.forEach(l => {
      sheetName.appendRow([new Date().toISOString(), l.blook, l.price, l.seller, l.qty]);
    });
    return ContentService.createTextOutput('ok');
  }
  
  return ContentService.createTextOutput('invalid');
}
