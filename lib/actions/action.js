/**
 * : zenhub-component
 * Copyright Â© 2022,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 */
 const componentJson = require("../../component.json");
 const { getMetadata, endpointCall } = require("../utils/helpers");
 
 async function processAction(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
 
   const action = componentJson.actions[tokenData["function"]];
   const { pathName, method, requestContentType } = action.callParams;
   const bodyParams = action.bodyParams.map(({ name }) => {
     return name;
   });
 
   const body = msg.data;
   let parameters = {};
   for (let param of bodyParams) {
     parameters[param] = body[param];
   }

   
   const base = 'https://api.zenhub.com';
   const url = base + setupUrlParamaters(pathName, body);
   const options = {
     method: method,
     headers: {
       Accept: 'application/json',
       'Content-Type': 'application/json',
       'X-Authentication-Token': cfg['key']
     },
     data: body,
     params: parameters,
   };
 
   const { data } = await endpointCall(url, options);
   const newElement = {};
   newElement.metadata = getMetadata(msg.metadata);
   newElement.data = data;
   this.emit("data",newElement)
 }
 
 module.exports = { process: processAction };