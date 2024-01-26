export const API_URL = `http://${window.location.hostname}/api`;
export const HOST_URL = `http://${window.location.hostname}`;

export const convertApiUrl = (url: string, param: string="") => {
  let finalUrl = API_URL+"/"+url;
  if (param !== "") {
    finalUrl = finalUrl+"/"+param;
  }
  finalUrl = finalUrl;
  return finalUrl;
}