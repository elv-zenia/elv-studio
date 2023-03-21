const defaultAbrDrmProfile = require("./profiles/abrProfileDrm.json");
const defaultAbrClearProfile = require("./profiles/abrProfileClear.json");

/**
 * Manipulate ABR Profile to return only Widevine and
 * Fairplay playout formats
 * @param {Object=} abrProfile - ABR profile
 *
 * @returns {Object} - ABR Profile with the appropriate playout formats
 */
export const DrmWidevineFairplayProfile = ({abrProfile={}}) => {
  if(!abrProfile.playout_formats) { throw Error("No playout formats found"); }

  const restrictedFormats = {
    "hls-fairplay": abrProfile.playout_formats["hls-fairplay"],
    "dash-widevine": abrProfile.playout_formats["dash-widevine"]
  };

  abrProfile.playout_formats = restrictedFormats;

  return {
    ok: true,
    result: abrProfile
  };
};

export const DrmPublicProfile = ({abrProfile}) => {
  if(!abrProfile.playout_formats) { throw Error("No playout formats found"); }

  let playoutFormats = {};

  Object.keys(abrProfile.playout_formats).forEach(formatName => {
    if(!["fairplay", "clear"].some(name => formatName.includes(name))) {
      playoutFormats[formatName] = abrProfile.playout_formats[formatName];
    }
  });

  abrProfile.playout_formats = playoutFormats;

  return {
    ok: true,
    result: abrProfile
  };
};

export const abrProfileDrm = defaultAbrDrmProfile;
export const abrProfileClear = defaultAbrClearProfile;
export const abrProfileBoth = defaultAbrClearProfile;
