const BASE_URL = "http://www2.assemblee-nationale.fr/";

const PARAM_OFFSET = "{offset}";
const PARAM_DEPUTE_ID = "{depute_id}";
const PARAM_LAW_ID = "{law_id}";

const MANDATE_NUMBER = "14";
const DEPUTES_LIST_URL = BASE_URL + "deputes/liste/departements/(vue)/tableau";
const DEPUTE_INFO_URL = BASE_URL + "deputes/fiche/" + PARAM_DEPUTE_ID;
const DEPUTE_PHOTO_URL = BASE_URL + "static/tribun/" + MANDATE_NUMBER + "/photos/" + PARAM_DEPUTE_ID + ".jpg"
const DEPUTE_VOTES_URL = BASE_URL + "deputes/votes/(offset)/" + PARAM_OFFSET + "/(id_omc)/OMC_PA" + PARAM_DEPUTE_ID + "/(legislature)/" + MANDATE_NUMBER;
const LAW_URL = BASE_URL + "scrutins/detail/(legislature)/" + MANDATE_NUMBER + "/(num)/" + PARAM_LAW_ID;

const ALL_DEPUTES_URL = "http://www.nosdeputes.fr/deputes/enmandat/json";

const SAVE_PHOTO_PATH = './assets/images/deputes/'

module.exports = {
  BASE_URL: BASE_URL,
  PARAM_OFFSET: PARAM_OFFSET,
  PARAM_DEPUTE_ID: PARAM_DEPUTE_ID,
  PARAM_LAW_ID: PARAM_LAW_ID,
  MANDATE_NUMBER: MANDATE_NUMBER,
  DEPUTES_LIST_URL: DEPUTES_LIST_URL,
  DEPUTE_INFO_URL: DEPUTE_INFO_URL,
  DEPUTE_PHOTO_URL: DEPUTE_PHOTO_URL,
  DEPUTE_VOTES_URL: DEPUTE_VOTES_URL,
  LAW_URL: LAW_URL,
  ALL_DEPUTES_URL: ALL_DEPUTES_URL,
  SAVE_PHOTO_PATH: SAVE_PHOTO_PATH
}
