/**
 * : zenhub-component
 * Copyright Â© 2022,  AG
 *
 * All files of this connector are licensed under the Apache 2.0 License. For details
 * see the file LICENSE on the toplevel directory.
 *
 */
const componentJson = require("../../component.json");
const {
    dataAndSnapshot,
    getMetadata,
    getElementDataFromResponse,
    endpointCall
  } = require("../utils/helpers");


async function processTrigger(msg, cfg, snapshot, incomingMessageHeaders, tokenData) {
  snapshot.lastUpdated = snapshot.lastUpdated || new Date(0).getTime();

  const { snapshotKey, arraySplittingKey, syncParam, skipSnapshot } = cfg.nodeSettings;
  const trigger = componentJson.triggers[tokenData["function"]];
  const { pathName, method, requestContentType } = trigger.callParams;
  const queryParams = trigger.queryParams ? trigger.queryParams.map(({ name }) => {
    return name;
  }) : [];


  const body = msg.data;
  let parameters = {};
  for (let param of queryParams) {
    parameters[param] = body[param];
  }
  if (syncParam) {
    parameters[syncParam] = snapshot.lastUpdated;
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
    params: parameters
  };

  const { data } = await endpointCall(url, options);
  const newElement = {};
  newElement.metadata = getMetadata(msg.metadata);
  newElement.data = getElementDataFromResponse(arraySplittingKey,data);
  if(skipSnapshot){
    return newElement.data; 
  } else {
    await dataAndSnapshot(newElement,snapshot,snapshotKey, 'modified_at', this);
  }
}

module.exports = { process: processTrigger };


