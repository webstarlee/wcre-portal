export const API_URL = import.meta.env.VITE_PRODUCTION == "prod" ? `https://${window.location.hostname}/api` : `http://${window.location.hostname}/api`;
export const HOST_URL = import.meta.env.VITE_PRODUCTION == "prod" ? `https://${window.location.hostname}` : `http://${window.location.hostname}`;

export const convertApiUrl = (url: string, param: string="") => {
  let finalUrl = API_URL+"/"+url;
  if (param !== "") {
    finalUrl = finalUrl+"/"+param;
  }
  finalUrl = finalUrl;
  return finalUrl;
}