import axios from "axios";
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

export const getLatLng = async (address: string) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyBoKJVMAXzJSwPJUgSLzbbwWz-px77dK_s`;
  const response = await axios.get(url);

  if (response.status === 200) {
    return response.data.results[0].geometry.location
  }

  return null
}