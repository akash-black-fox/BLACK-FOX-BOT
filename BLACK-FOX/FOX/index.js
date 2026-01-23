"use strict";

const utils = require("./utils");
const fs = require("fs");
const cron = require("node-cron");

let globalOptions = {};
let ctx = null;
let defaultFuncs = null;
let api = null;
let region = null;

const fbLink = (ext) => ("https://www.facebook.com" + (ext ? '/' + ext : ''));
const ERROR_RETRIEVING = "Error retrieving userID. This can be caused by many factors, including being blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";
const logColor = "\x1b[36m"; 
const resetColor = "\x1b[0m";

async function setOptions(options = {}) {
  const optionHandlers = {
    online: (value) => (globalOptions.online = Boolean(value)),
    selfListen: (value) => (globalOptions.selfListen = Boolean(value)),
    selfListenEvent: (value) => (globalOptions.selfListenEvent = value),
    listenEvents: (value) => (globalOptions.listenEvents = Boolean(value)),
    updatePresence: (value) => (globalOptions.updatePresence = Boolean(value)),
    forceLogin: (value) => (globalOptions.forceLogin = Boolean(value)),
    userAgent: (value) => (globalOptions.userAgent = value),
    autoMarkDelivery: (value) => (globalOptions.autoMarkDelivery = Boolean(value)),
    autoMarkRead: (value) => (globalOptions.autoMarkRead = Boolean(value)),
    listenTyping: (value) => (globalOptions.listenTyping = Boolean(value)),
    proxy: (value) => {
      if (typeof value !== "string") {
        delete globalOptions.proxy;
        utils.setProxy();
      } else {
        globalOptions.proxy = value;
        utils.setProxy(value);
      }
    },
    autoReconnect: (value) => (globalOptions.autoReconnect = Boolean(value)),
    emitReady: (value) => (globalOptions.emitReady = Boolean(value)),
    randomUserAgent: (value) => {
      globalOptions.randomUserAgent = Boolean(value);
      if (value) {
        globalOptions.userAgent = utils.randomUserAgent();
      }
    },
    bypassRegion: (value) => (globalOptions.bypassRegion = value),
  };
  
  Object.entries(options).forEach(([key, value]) => {
    if (optionHandlers[key]) optionHandlers[key](value);
  });
}

async function checkIfSuspended(resp, appstate) {
  try {
    const appstateCUser = appstate.find((i) => i.key === "c_user" || i.key === "i_user");
    const UID = appstateCUser?.value;
    
    if (resp?.request?.uri?.href?.includes(fbLink("checkpoint")) && resp.request.uri.href.includes("1501092823525282")) {
      const suspendReasons = {};
      
      const daystoDisable = resp.body?.match(/"log_out_uri":"(.*?)","title":"(.*?)"/);
      if (daystoDisable?.[2]) {
        suspendReasons.durationInfo = daystoDisable[2];
      }
      
      const reasonDescription = resp.body?.match(/"reason_section_body":"(.*?)"/);
      if (reasonDescription && reasonDescription[1]) {
        suspendReasons.longReason = reasonDescription[1];
        suspendReasons.shortReason = suspendReasons.longReason
          .toLowerCase()
          .replace("your account, or activity on it, doesn't follow our community standards on ", "")
          .replace(/^\w/, (c) => c.toUpperCase());
      }
      
      ctx = null;
      return { suspended: true, suspendReasons };
    }
  } catch (error) {
  }
}

async function checkIfLocked(resp, appstate) {
  try {
    const appstateCUser = appstate.find((i) => i.key === "c_user" || i.key === "i_user");
    const UID = appstateCUser?.value;
    
    if (resp?.request?.uri?.href?.includes(fbLink("checkpoint")) && resp.request.uri.href.includes("828281030927956")) {
      const lockedReasons = {};
      const lockDesc = resp.body?.match(/"is_unvetted_flow":true,"title":"(.*?)"/);
      
      if (lockDesc && lockDesc[1]) {
        lockedReasons.reason = lockDesc[1];
      }
      
      ctx = null;
      return { locked: true, lockedReasons };
    }
  } catch (error) {
  }
}

async function buildAPI(html, jar) {
  let userID;
  const filePath = "black-fox-data.json";
  const cookies = jar.getCookies(fbLink());
  const primaryProfile = cookies.find((val) => val.cookieString().startsWith("c_user="));
  const secondaryProfile = cookies.find((val) => val.cookieString().startsWith("i_user="));
  
  if (!primaryProfile && !secondaryProfile) {
    throw new Error(ERROR_RETRIEVING);
  }
  
  if (html.includes("/checkpoint/block/?next")) {
    throw new Error("Checkpoint detected");
  }
  
  userID = secondaryProfile?.cookieString().split("=")[1] || primaryProfile.cookieString().split("=")[1];
  const refreshFb_dtsg = async () => {
    const getDtsg = await utils.get(fbLink("ajax/dtsg/?__a=true"), jar, null, globalOptions);
    const dtsg = JSON.parse(getDtsg.body.replace('for (;;);{', "{")).payload.token;
    let jazoest = "2";
    for (const char of dtsg) {
      jazoest += char.charCodeAt(0);
    }
    const result = { fb_dtsg: dtsg, jazoest };
    const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : {};
    existingData[userID] = result;
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4), "utf8");
    return result;
  }
  const dtsgResult = await refreshFb_dtsg();
  
  console.log(`${logColor}➤ [LOGIN]${resetColor} Logged in!`);
  console.log(`${logColor}➤ [LOGIN]${resetColor} Choosing best region...`);
  
  const clientID = (Math.random() * 2147483648 | 0).toString(16);
  const mqttMatches = {
    oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
    newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
    legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/),
  };
  let mqttEndpoint, irisSeqID;
  for (const [key, match] of Object.entries(mqttMatches)) {
    if (globalOptions.bypassRegion || !match) continue;
    if (key === "oldFBMQTTMatch") {
      irisSeqID = match[1];
      mqttEndpoint = match[2].replace(/\\\//g, "/");
      region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
    } else if (key === "newFBMQTTMatch") {
      irisSeqID = match[2];
      mqttEndpoint = match[1].replace(/\\\//g, "/");
      region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
    } else if (key === "legacyFBMQTTMatch") {
      mqttEndpoint = match[2].replace(/\\\//g, "/");
      region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
    }
    break;
  }
  if (globalOptions.bypassRegion) {
    region = globalOptions.bypassRegion.toUpperCase();
  }
  if (!region) {
    const regions = ["prn", "pnb", "vll", "hkg", "sin", "ftw", "ash"];
    region = regions[Math.floor(Math.random() * regions.length)].toUpperCase();
  }
  
  mqttEndpoint = mqttEndpoint || `wss://edge-chat.facebook.com/chat?region=${region}`;
  
  console.log(`${logColor}➤ [LOGIN]${resetColor} Region: ${region}`);
  
  ctx = {
    userID,
    jar,
    clientID,
    globalOptions,
    loggedIn: true,
    access_token: "NONE",
    clientMutationId: 0,
    mqttClient: undefined,
    lastSeqId: irisSeqID,
    syncToken: undefined,
    mqttEndpoint,
    wsReqNumber: 0,
    wsTaskNumber: 0,
    reqCallbacks: {},
    region,
    firstListen: true,
    ...dtsgResult,
  };
  defaultFuncs = utils.makeDefaults(html, userID, ctx);
  return [ctx, defaultFuncs, {
    refreshFb_dtsg
  }];
}

async function loginHelper(appState, apiCustomized, callback) {
  try {
    const jar = utils.getJar();
    
    if (appState) {
      ((Array.isArray(appState) ? appState.map(c => [c.name || c.key, c.value].join('=')) : appState?.split(';')) || '').map(cookieString => {
        const domain = ".facebook.com";
        const expires = new Date().getTime() + 1000 * 60 * 60 * 24 * 365;
        const str = `${cookieString}; expires=${expires}; domain=${domain}; path=/;`;
        jar.setCookie(str, `http://${domain}`);
      });
    } else {
      throw new Error("No cookie found. Enter cookie (whether JSON/header string)");
    }
    api = {
      setOptions: setOptions.bind(null, globalOptions),
      getAppState() {
        const appState = utils.getAppState(jar);
        if (!Array.isArray(appState)) return [];
        const uniqueAppState = appState.filter((item, index, self) => self.findIndex((t) => t.key === item.key) === index);
        return uniqueAppState.length > 0 ? uniqueAppState : appState;
      },
    };
    const mergedAppState = api.getAppState();
    const resp = await utils.get(fbLink(), jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
    const [newCtx, newDefaultFuncs, apiFuncs] = await buildAPI(resp.body, jar);
    ctx = newCtx;
    defaultFuncs = newDefaultFuncs;
    api.addFunctions = (directory) => {
      const folder = directory.endsWith("/") ? directory : `${directory}/`;
      fs.readdirSync(folder).filter((v) => v.endsWith(".js")).forEach((v) => {
        api[v.replace(".js", "")] = require(`${folder}${v}`)(defaultFuncs, api, ctx);
      });
    };
    api.addFunctions(`${__dirname}/src`);
    api.listen = api.listenMqtt;
    api.refreshFb_dtsg = apiFuncs.refreshFb_dtsg;
    api.ws3 = { ...(apiCustomized && { ...apiCustomized }) };
    const userID = api.getCurrentUserID();
    if (resp?.request?.uri?.href?.includes(fbLink("checkpoint")) && resp.request.uri.href.includes("601051028565049")) {
      const bypassAutomation = await defaultFuncs.post(fbLink("api/graphql"), jar, {
        av: userID,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "FBScrapingWarningMutation",
        variables: '{}',
        server_timestamps: true,
        doc_id: 6339492849481770,
        ...(ctx && {
          fb_dtsg: ctx.fb_dtsg,
          jazoest: ctx.jazoest
        })
      }, globalOptions);
    }
    const detectLocked = await checkIfLocked(resp, mergedAppState);
    if (detectLocked) throw detectLocked;
    const detectSuspension = await checkIfSuspended(resp, mergedAppState);
    if (detectSuspension) throw detectSuspension;
    
    console.log(`${logColor}➤ [LOGIN]${resetColor} Successfully logged in!`);
    
    return callback(null, api);
  } catch (error) {
    return callback(error);
  }
}

async function login(cookie, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  
  const defaultOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: true,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: true,
    autoReconnect: true,
    online: true,
    emitReady: false,
    userAgent: utils.defaultUserAgent,
    randomUserAgent: false,
  };
  
  Object.assign(globalOptions, defaultOptions, options);
  
  const loginWs3 = () => {
    loginHelper(cookie, {
        relogin: loginWs3,
      },
      (loginError, loginApi) => {
        if (loginError) {
            return callback(loginError);
        }
        return callback(null, loginApi);
      }
    );
  };
  
  await setOptions(options);
  loginWs3();
}

module.exports = {
    login
};
