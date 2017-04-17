const BASE_URL = "http://www2.assemblee-nationale.fr/";

const PARAM_OFFSET = "{offset}";
const PARAM_DEPUTY_ID = "{deputy_id}";
const PARAM_LAW_ID = "{law_id}";

const MANDATE_NUMBER = "14";
const DEPUTIES_LIST_URL = BASE_URL + "deputes/liste/departements/(vue)/tableau";
const DEPUTY_INFO_URL = BASE_URL + "deputes/fiche/OMC_PA" + PARAM_DEPUTY_ID;
const DEPUTE_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTY_ID + ".jpg"
const DEPUTE_VOTES_URL = BASE_URL + "deputes/votes/(offset)/" + PARAM_OFFSET + "/(id_omc)/OMC_PA" + PARAM_DEPUTY_ID + "/(legislature)/" + MANDATE_NUMBER;
const LAW_URL = BASE_URL + "scrutins/detail/(legislature)/" + MANDATE_NUMBER + "/(num)/" + PARAM_LAW_ID;

const ALL_DEPUTES_URL = "http://www.nosdeputes.fr/deputes/enmandat/json";

const SAVE_PHOTO_PATH = './assets/images/deputes/'

module.exports = {
  BASE_URL: BASE_URL,
  PARAM_OFFSET: PARAM_OFFSET,
  PARAM_DEPUTY_ID: PARAM_DEPUTY_ID,
  PARAM_LAW_ID: PARAM_LAW_ID,
  MANDATE_NUMBER: MANDATE_NUMBER,
  DEPUTIES_LIST_URL: DEPUTIES_LIST_URL,
  DEPUTY_INFO_URL: DEPUTY_INFO_URL,
  DEPUTE_PHOTO_URL: DEPUTE_PHOTO_URL,
  DEPUTE_VOTES_URL: DEPUTE_VOTES_URL,
  LAW_URL: LAW_URL,
  ALL_DEPUTES_URL: ALL_DEPUTES_URL,
  SAVE_PHOTO_PATH: SAVE_PHOTO_PATH
}
