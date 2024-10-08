import defaultAbrDrmProfile from "./profiles/abrProfileDrm.json";
import defaultAbrClearProfile from "./profiles/abrProfileClear.json";
import defaultAbrBothProfile from "./profiles/abrProfileBoth.json";

/**
 * Manipulate ABR Profile to return only Widevine and
 * Fairplay playout formats
 * @param {Object=} abrProfile - ABR profile
 *
 * @returns {Object} - ABR Profile with the appropriate playout formats
 */
export const DrmWidevineFairplayProfile = ({abrProfile={}}) => {
  if(!abrProfile.playout_formats) { abrProfile["playout_formats"] = {}; }

  const restrictedFormats = {
    "hls-fairplay": abrProfile.playout_formats["hls-fairplay"],
    "dash-widevine": abrProfile.playout_formats["dash-widevine"]
  };

  const hasPlayouts = Object.keys(restrictedFormats).some(format => abrProfile.playout_formats[format]);

  abrProfile.playout_formats = restrictedFormats;

  return {
    ok: hasPlayouts,
    result: abrProfile
  };
};

export const DrmPublicProfile = ({abrProfile}) => {
  let playoutFormats = {};

  Object.keys(abrProfile.playout_formats || {}).forEach(formatName => {
    if(!["fairplay", "clear"].some(name => formatName.includes(name))) {
      playoutFormats[formatName] = abrProfile.playout_formats[formatName];
    }
  });

  abrProfile.playout_formats = playoutFormats;

  return {
    ok: playoutFormats === {} ? false : true,
    result: abrProfile
  };
};

/**
 * Manipulate ABR Profile to include HLS Widevine and
 * HLS PlayReady playout formats
 * @param {Object=} abrProfile - ABR profile
 *
 * @returns {Object} - ABR Profile with the appropriate playout formats
 */
export const DrmPlayReadyWidevine = ({abrProfile}) => {
  abrProfile.playout_formats["hls-widevine-cenc"] = {
    "drm": {
      "enc_scheme_name": "cenc",
      "type": "DrmWidevine"
    },
    "protocol": {
      "type": "ProtoHls"
    }
  };

  abrProfile.playout_formats["hls-playready-cenc"] = {
    "drm": {
      "enc_scheme_name": "cenc",
      "type": "DrmPlayReady"
    },
    "protocol": {
      "type": "ProtoHls"
    }
  };

  return {
    ok: true,
    result: abrProfile
  };
};

export const abrProfileDrm = defaultAbrDrmProfile;
export const abrProfileClear = defaultAbrClearProfile;
export const abrProfileBoth = defaultAbrBothProfile;
