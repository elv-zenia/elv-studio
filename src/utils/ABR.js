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
